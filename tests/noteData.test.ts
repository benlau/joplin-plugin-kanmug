import { NoteDataMonad, JoplinTag, UpdateQuery } from "../src/types";

describe("NoteDataMonad", () => {
  describe("constructor and static factories", () => {
    test("fromJoplinNote creates NoteDataMonad with correct defaults", () => {
      const joplinNote = {
        id: "note1",
        title: "Test Note",
        parent_id: "notebook1",
        is_todo: true,
        todo_completed: true,
        todo_due: 1234567890,
        order: 5,
        created_time: 1000000000,
      };

      const noteMonad = NoteDataMonad.fromJoplinNote(joplinNote);

      expect(noteMonad.data).toEqual({
        id: "note1",
        title: "Test Note",
        tags: [],
        notebookId: "notebook1",
        isTodo: true,
        isCompleted: true,
        due: 1234567890,
        order: 5,
        createdTime: 1000000000,
      });
    });

    test("fromNewNote creates empty note with given id", () => {
      const noteMonad = NoteDataMonad.fromNewNote("new-note-id");

      expect(noteMonad.data).toMatchObject({
        id: "new-note-id",
        title: "",
        tags: [],
        notebookId: "",
        isTodo: false,
        isCompleted: false,
        due: 0,
        order: 0,
      });
    });
  });

  describe("tag operations", () => {
    test("setTagsFromJoplinTagList sets tags from JoplinTag array", () => {
      const noteMonad = NoteDataMonad.fromNewNote("note1");
      const joplinTags: JoplinTag[] = [
        { id: "tag1", title: "Tag1", parent_id: "" },
        { id: "tag2", title: "Tag2", parent_id: "" },
      ];

      noteMonad.setTagsFromJoplinTagList(joplinTags);

      expect(noteMonad.data.tags).toEqual(["Tag1", "Tag2"]);
    });
  });

  describe("applyUpdateQuery", () => {
    let noteMonad: NoteDataMonad;

    beforeEach(() => {
      noteMonad = NoteDataMonad.fromNewNote("note1");
      noteMonad.setTagsFromJoplinTagList([
        { id: "tag1", title: "ExistingTag", parent_id: "" },
      ]);
    });

    test("updates note properties on PUT query", () => {
      const query: UpdateQuery = {
        type: "put",
        path: ["notes", "note1"],
        body: {
          title: "Updated Title",
        },
      };

      noteMonad.applyUpdateQuery(query);

      expect(noteMonad.data.title).toBe("Updated Title");
    });

    test("adds tags on POST query", () => {
      const query: UpdateQuery = {
        type: "post",
        path: ["tags", "tag2", "notes"],
        body: { id: "note1" },
        info: { tags: ["NewTag"] },
      };

      noteMonad.applyUpdateQuery(query);

      expect(noteMonad.data.tags).toEqual(["ExistingTag", "NewTag"]);
    });

    test("removes tags on DELETE query", () => {
      const query: UpdateQuery = {
        type: "delete",
        path: ["tags", "tag1", "notes", "note1"],
        info: { tags: ["ExistingTag"] },
      };

      noteMonad.applyUpdateQuery(query);

      expect(noteMonad.data.tags).toEqual([]);
    });

    test("ignores irrelevant queries", () => {
      const initialState = { ...noteMonad.data };

      const query: UpdateQuery = {
        type: "put",
        path: ["notes", "different-note"],
        body: { title: "Different Note" },
      };

      noteMonad.applyUpdateQuery(query);

      expect(noteMonad.data).toEqual(initialState);
    });
  });
});
