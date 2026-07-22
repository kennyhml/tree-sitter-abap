module.exports = {
  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_UPDATE_TASK_LOCAL.html
  set_update_task_local_statement: $ => seq($.__set_update_task_local_statement_prefix, "."),

  __set_update_task_local_statement_prefix: _ =>
    seq(...gen.kws("set", "update", "task", "local")),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOMMIT.html
  commit_work_statement: $ => seq($.__commit_work_statement_prefix, "."),

  __commit_work_statement_prefix: $ =>
    seq(...gen.kws("commit", "work"), optional($.and_wait)),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPROLLBACK.html
  rollback_work_statement: $ => seq($.__rollback_work_statement_prefix, "."),

  __rollback_work_statement_prefix: _ =>
    seq(...gen.kws("rollback", "work")),

  and_wait: _ => seq(...gen.kws("and", "wait")),
};
