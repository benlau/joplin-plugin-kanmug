import joplin from "api";
import { getUpdatedConfigNote } from "./parser";
import { NoteData, ConfigNote, UpdateQuery, NoteDataMonad } from "./types";

/**
 * Execute the given search query and return all matching notes in the kanban format.
 *
 * @see https://joplinapp.org/help/#searching
 */
async function search(query: string): Promise<NoteData[]> {
  const fields = [
    "id",
    "title",
    "parent_id",
    "is_todo",
    "todo_completed",
    "todo_due",
    "order",
    "created_time",
  ];

  type RawNote = {
    id: string;
    title: string;
    parent_id: string;
    is_todo: 0 | 1;
    todo_completed: 0 | 1;
    todo_due: number;
    order: number;
    created_time: number;
  };

  type Response = {
    items: RawNote[];
    has_more: boolean;
  };

  let allNotes: any[] = [];
  let page = 1;
  while (true) {
    const { items: notes, has_more: hasMore }: Response = await joplin.data.get(
      query === "" ? ["notes"] : ["search"],
      { query, page, fields },
    );
    allNotes = allNotes.concat(notes);

    if (!hasMore) break;
    else page++;
  }

  const inflightTagRequests = allNotes.map((note) =>
    joplin.data.get(["notes", note.id, "tags"]),
  );
  const tagsForNotes = (await Promise.all(inflightTagRequests)).map((r) =>
    r.items.map(({ title }: { title: string }) => title),
  );
  const result = allNotes.map(
    (note, index) =>
      <NoteData>{
        id: note.id,
        title: note.title,
        tags: tagsForNotes[index],
        isTodo: !!note.is_todo,
        isCompleted: !!note.todo_completed,
        notebookId: note.parent_id,
        due: note.todo_due,
        order: note.order === 0 ? note.created_time : note.order,
        createdTime: note.created_time,
      },
  );

  return result;
}

/**
 * Get all notes of interest using search. Can restrict search to a notebook.
 */
export async function searchNotes(
  rootNotebookName: string,
  baseTags: string[],
): Promise<NoteData[]> {
  const rules = [] as string[];
  if (rootNotebookName !== "") rules.push(`notebook:"${rootNotebookName}"`);
  baseTags.forEach((tag) => rules.push(`tag:"${tag}"`));
  return search(rules.join(" "));
}

/**
 * Get a specific note by id in the kanban format.
 */
export async function getNoteById(id: string): Promise<NoteData> {
  const note = await joplin.data.get(["notes", id]);
  const tags = await joplin.data.get(["notes", id, "tags"]);
  return NoteDataMonad.fromJoplinNote(note).setTagsFromJoplinTagList(tags.items)
    .data;
}

/**
 * Execute an update query, produced by rules.
 */
export async function executeUpdateQuery(updateQuery: UpdateQuery) {
  const { type, path, body = null } = updateQuery;
  if (type === "put" && path[0] === "notes") {
    // need to save updated_time
    const { updated_time, user_updated_time } = await joplin.data.get(path, {
      fields: ["updated_time", "user_updated_time"],
    });
    const patchedBody = { ...body, updated_time, user_updated_time };
    await joplin.data.put(path, null, patchedBody);
  } else {
    await joplin.data[type](path, null, body);
  }
}

/**
 * Get the title, parent_id, body of the given note.
 *
 * Used for the config note, because that's the only note whose body we're interested in.
 */
export function getConfigNote(noteId: string): Promise<ConfigNote> {
  const fields = ["id", "title", "parent_id", "body"];
  return joplin.data.get(["notes", noteId], { fields });
}

/**
 * Update the config note with the given yaml and after text.
 *
 * @param config Make sure to pass in the yaml **without** ```kanban fence.
 */
export async function setConfigNote(
  noteId: string,
  config: string | null = null,
  after: string | null = null,
): Promise<string> {
  const { body: oldBody } = await getConfigNote(noteId);
  const newBody = getUpdatedConfigNote(oldBody, config, after);
  await joplin.data.put(["notes", noteId], null, { body: newBody });
  return newBody;
}

/**
 * Get the id of a tag by name.
 */
export async function getTagId(tagName: string): Promise<string | undefined> {
  const {
    items: [{ id = undefined } = {}],
  } = await joplin.data.get(["search"], { query: tagName, type: "tag" });
  return id;
}

/**
 * Get a list of all tags.
 */
export async function getAllTags(): Promise<string[]> {
  let tags: string[] = [];
  let page = 1;
  while (true) {
    const {
      items: newTags,
      has_more: hasMore,
    }: { items: { title: string }[]; has_more: boolean } =
      await joplin.data.get(["tags"], { page });
    tags = [...tags, ...newTags.map((t) => t.title)];

    if (!hasMore) break;
    else page++;
  }

  return tags;
}

/**
 * Create a new tag by name.
 */
export async function createTag(tagName: string): Promise<string> {
  const result = await joplin.data.post(["tags"], null, { title: tagName });
  return result.id;
}

/**
 * Create a new notebook by path. Creates all missing parents.
 *
 * Think `mkdir -p`
 *
 * @see https://github.com/joplin/plugin-kanban#filters
 */
export async function createNotebook(notebookPath: string): Promise<string> {
  const parts = notebookPath.split("/");
  let parentId = "";
  for (let i = 0; i < parts.length; i++) {
    const currentPath = `/${parts.slice(0, i + 1)}`;
    const id =
      (await resolveNotebookPath(currentPath)) ||
      (
        await joplin.data.post(["folders"], null, {
          title: parts[i],
          parent_id: parentId,
        })
      ).id;
    parentId = id;
  }

  return parentId;
}

/**
 * Resolve a notebook by path.
 *
 * @see https://github.com/joplin/plugin-kanban#filters
 */
export async function resolveNotebookPath(
  notebookPath: string,
): Promise<string | null> {
  const foldersData = await getAllNotebooks();
  const parts = notebookPath.split("/");

  let parentId = "";
  do {
    const currentPart = parts.shift();
    if (currentPart === "") continue;

    const currentFolder = foldersData.find(
      ({ title, parent_id }: { title: string; parent_id: string }) =>
        title === currentPart && parent_id === parentId,
    );
    if (!currentFolder) return null;

    parentId = currentFolder.id;
  } while (parts.length);

  return parentId;
}

/**
 * Recusively find all notebooks within the given notebook.
 */
export async function findAllChildrenNotebook(
  parentId: string,
): Promise<string[]> {
  const foldersData = await getAllNotebooks();

  let children: string[] = [];
  const recurse = (id: string) => {
    const newChildren = foldersData
      .filter(({ parent_id }: { parent_id: string }) => parent_id === id)
      .map(({ id }: { id: string }) => id);
    newChildren.forEach((id: string) => recurse(id));
    children = [...children, ...newChildren];
  };

  recurse(parentId);
  return children;
}

type Folder = {
  id: string;
  title: string;
  parent_id: string;
};

/**
 * Get a list of all notebooks, with id, title, and parent_id.
 */
export async function getAllNotebooks(): Promise<Folder[]> {
  let folders: Folder[] = [];
  let page = 1;
  while (true) {
    const {
      items: newFolders,
      has_more: hasMore,
    }: { items: Folder[]; has_more: boolean } = await joplin.data.get(
      ["folders"],
      { page },
    );
    folders = [...folders, ...newFolders];

    if (!hasMore) break;
    else page++;
  }

  return folders;
}

/**
 * Get the path associated with the notebook id.
 */
export async function getNotebookPath(searchId: string): Promise<string> {
  const foldersData = await getAllNotebooks();

  const recurse = (parentId: string, currentPath: string): string | null => {
    const children = foldersData.filter(
      ({ parent_id }) => parent_id === parentId,
    );
    if (children.length === 0) return null;

    const match = children.find(({ id }) => id === searchId);
    if (match) return `${currentPath}/${match.title}`;

    for (const child of children) {
      const res = recurse(child.id, `${currentPath}/${child.title}`);
      if (res) return res;
    }

    return null;
  };

  return recurse("", "") as string;
}
