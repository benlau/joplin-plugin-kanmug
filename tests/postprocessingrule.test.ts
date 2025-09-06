import {
  DisableToPutParentIdToEmpty,
  PostProcessingRuleState,
} from "../src/postprocessingrules";
import { UpdateQuery } from "../src/types";

describe("PostProcessingRules", () => {
  describe("DisableToPutParentIdToEmpty", () => {
    // Define constants for test values
    const COMMAND_TYPE = "showBanner";
    const MESSAGE_ID = "disable-to-put-parent-id-to-empty";
    const MESSAGE_SEVERITY = "warning";

    it("should block updates with empty parent_id and add banner command", () => {
      const rule = new DisableToPutParentIdToEmpty();
      const initialState: PostProcessingRuleState = {
        updates: [
          {
            type: "put",
            path: ["notes", "123"],
            body: {
              parent_id: "",
              title: "Test note",
            },
          } as UpdateQuery,
        ],
        commands: [],
      };

      // Act
      const result = rule.process(initialState);

      // Assert
      expect(result.updates).toEqual([]);
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0]).toEqual({
        type: COMMAND_TYPE,
        messages: [
          {
            id: MESSAGE_ID,
            title: DisableToPutParentIdToEmpty.ERROR_MESSAGE,
            severity: MESSAGE_SEVERITY,
            actions: ["clear"],
            details: "",
          },
        ],
      });
    });

    it("should allow updates with non-empty parent_id", () => {
      // Arrange
      const rule = new DisableToPutParentIdToEmpty();
      const initialState: PostProcessingRuleState = {
        updates: [
          {
            type: "put",
            path: ["notes", "123"],
            body: {
              parent_id: "some-parent-id",
              title: "Test note",
            },
          } as UpdateQuery,
        ],
        commands: [],
      };

      // Act
      const result = rule.process(initialState);

      // Assert
      expect(result.updates).toEqual(initialState.updates);
      expect(result.commands).toEqual([]);
    });

    it("should allow updates with unset/set parent_id", () => {
      // Arrange
      const rule = new DisableToPutParentIdToEmpty();
      const initialState: PostProcessingRuleState = {
        updates: [
          {
            type: "put",
            path: ["notes", "123"],
            body: {
              parent_id: "",
              title: "Test note",
            },
          } as UpdateQuery,
          {
            type: "put",
            path: ["notes", "123"],
            body: {
              parent_id: "some-parent-id",
              title: "Test note",
            },
          } as UpdateQuery,
        ],
        commands: [],
      };

      const result = rule.process(initialState);

      expect(result.updates).toEqual([
        {
          type: "put",
          path: ["notes", "123"],
          body: {
            parent_id: "some-parent-id",
            title: "Test note",
          },
        } as UpdateQuery,
      ]);
      expect(result.commands).toEqual([]);
    });
  });
});
