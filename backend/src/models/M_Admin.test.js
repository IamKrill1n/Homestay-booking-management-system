import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { M_Admin } from "./M_Admin.js";

function createRepositoryStub(overrides = {}) {
  const calls = [];
  return {
    calls,
    repo: {
      findPendingHomestays: async () => {
        calls.push({ method: "findPendingHomestays", args: [] });
        return overrides.findPendingHomestays;
      },
      findAllHomestaysForAdmin: async () => {
        calls.push({ method: "findAllHomestaysForAdmin", args: [] });
        return overrides.findAllHomestaysForAdmin;
      },
      setHomestayStatus: async (...args) => {
        calls.push({ method: "setHomestayStatus", args });
        return overrides.setHomestayStatus;
      },
    },
  };
}

describe("M_Admin", () => {
  it("viewPendingHomestays() returns pending homestays from the repository", async () => {
    const pendingHomestays = [
      { homestayID: 1, title: "Mountain Cabin", status: "pending" },
      { homestayID: 2, title: "City Loft", status: "pending" },
    ];
    const { calls, repo } = createRepositoryStub({
      findPendingHomestays: pendingHomestays,
    });

    const result = await new M_Admin(repo).viewPendingHomestays();

    assert.deepEqual(result, pendingHomestays);
    assert.deepEqual(calls, [{ method: "findPendingHomestays", args: [] }]);
  });

  it('approveHomestay(id) approves the homestay and returns a valid response', async () => {
    const approvedHomestay = { homestayID: 7, status: "approved", isVerified: true };
    const { calls, repo } = createRepositoryStub({
      setHomestayStatus: approvedHomestay,
    });

    const result = await new M_Admin(repo).approveHomestay(7);

    assert.deepEqual(calls, [
      { method: "setHomestayStatus", args: [7, "approved", true, null] },
    ]);
    assert.deepEqual(result, {
      valid: true,
      homestay: approvedHomestay,
      message: "You have approved a homestay.",
    });
  });

  it('approveHomestay(id) returns not found when the repository returns null', async () => {
    const { calls, repo } = createRepositoryStub({ setHomestayStatus: null });

    const result = await new M_Admin(repo).approveHomestay(99);

    assert.deepEqual(calls, [
      { method: "setHomestayStatus", args: [99, "approved", true, null] },
    ]);
    assert.deepEqual(result, { valid: false, message: "Homestay not found" });
  });

  it("rejectHomestay(id, reason) trims the reason, rejects the homestay, and returns a valid response", async () => {
    const rejectedHomestay = {
      homestayID: 8,
      status: "rejected",
      isVerified: false,
      rejectionReason: "Missing safety documentation",
    };
    const { calls, repo } = createRepositoryStub({
      setHomestayStatus: rejectedHomestay,
    });

    const result = await new M_Admin(repo).rejectHomestay(
      8,
      "  Missing safety documentation  "
    );

    assert.deepEqual(calls, [
      {
        method: "setHomestayStatus",
        args: [8, "rejected", false, "Missing safety documentation"],
      },
    ]);
    assert.deepEqual(result, {
      valid: true,
      homestay: rejectedHomestay,
      message: "You have rejected a homestay. Reason: Missing safety documentation",
    });
  });

  it("rejectHomestay(id, '') returns a validation error without calling the repository", async () => {
    const { calls, repo } = createRepositoryStub();

    const result = await new M_Admin(repo).rejectHomestay(8, "");

    assert.deepEqual(calls, []);
    assert.deepEqual(result, {
      valid: false,
      message: "A rejection reason is required",
    });
  });

  it("rejectHomestay(id, whitespace) returns a validation error without calling the repository", async () => {
    const { calls, repo } = createRepositoryStub();

    const result = await new M_Admin(repo).rejectHomestay(8, "   \t\n  ");

    assert.deepEqual(calls, []);
    assert.deepEqual(result, {
      valid: false,
      message: "A rejection reason is required",
    });
  });

  it("rejectHomestay(id, reason) returns not found when the repository returns null", async () => {
    const { calls, repo } = createRepositoryStub({ setHomestayStatus: null });

    const result = await new M_Admin(repo).rejectHomestay(404, "Duplicate listing");

    assert.deepEqual(calls, [
      { method: "setHomestayStatus", args: [404, "rejected", false, "Duplicate listing"] },
    ]);
    assert.deepEqual(result, { valid: false, message: "Homestay not found" });
  });
});
