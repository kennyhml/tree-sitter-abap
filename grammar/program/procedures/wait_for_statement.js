module.exports = {
  /**
   * Covers the combinable WAIT FOR ASYNCHRONOUS TASKS,
   * WAIT FOR MESSAGING CHANNELS, and WAIT FOR PUSH CHANNELS variants:
   *
   * WAIT FOR ASYNCHRONOUS TASKS
   *          [MESSAGING CHANNELS]
   *          [PUSH CHANNELS]
   *          UNTIL log_exp [UP TO sec SECONDS].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWAIT_ARFC.html
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWAIT_AMC.html
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWAIT_APC.html
   */
  wait_for_statement: $ => seq($.__wait_for_statement_prefix, "."),

  __wait_for_statement_prefix: $ =>
    seq(
      ...gen.kws("wait", "for"),
      $.await_list,
      $.await_until_spec,
      optional($.await_up_to_spec),
    ),

  await_list: $ =>
    choice(
      seq(
        $.asynchronous_tasks,
        optional($.messaging_channels),
        optional($.push_channels),
      ),
      seq(
        $.messaging_channels,
        optional($.push_channels),
        optional($.asynchronous_tasks),
      ),
      seq(
        $.push_channels,
        optional($.messaging_channels),
        optional($.asynchronous_tasks),
      ),
    ),

  asynchronous_tasks: _ => seq(...gen.kws("asynchronous", "tasks")),

  messaging_channels: _ => seq(...gen.kws("messaging", "channels")),

  push_channels: _ => seq(...gen.kws("push", "channels")),

  // ... UNTIL log_exp
  await_until_spec: $ =>
    seq(gen.kw("until"), field("condition", $._logical_expression)),

  // UP TO sec SECONDS
  await_up_to_spec: $ =>
    seq(
      ...gen.kws("up", "to"),
      field("seconds", $.data_object),
      gen.kw("seconds"),
    ),
};
