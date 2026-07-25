module.exports = {
  /**
   * ... { OUTPUT }
   *   | { ON {para|selcrit} }
   *   | { ON END OF selcrit }
   *   | { ON BLOCK block }
   *   | { ON RADIOBUTTON GROUP group }
   *   | { }
   *   | { ON {HELP-REQUEST|VALUE-REQUEST}
   *       FOR {para|selcrit-low|selcrit-high} }
   *   | { ON EXIT-COMMAND }.
   *
   * Because the body has no clear terminator, this rule is very prone to shift / reduce
   * conflicts. The only way to actually solve it seems to be using dynamic precenden
   * and adding the rule to conflicts.
   *
   */
  at_selscreen_statement: $ =>
    seq(
      ...gen.kws("at", "selection-screen"),
      optional(field("event", $.__selection_screen_event)),
      ".",
      optional(field("body", $.statement_block)),
    ),

  __selection_screen_event: $ =>
    choice(
      $.output,
      $.on_exit_command_spec,
      $.on_radiobutton_group_spec,
      $.on_block_spec,
      $.on_value_request_spec,
      $.on_help_request_spec,
      $.on_parameter_spec,
      $.on_end_of_parameter_spec,
    ),

  // { ON EXIT-COMMAND }
  on_exit_command_spec: _ => seq(...gen.kws("on", "exit-command")),

  // { ON RADIOBUTTON GROUP group }
  on_radiobutton_group_spec: $ =>
    seq(...gen.kws("on", "radiobutton", "group"), field("name", $.identifier)),

  // { ON BLOCK block }
  on_block_spec: $ =>
    seq(...gen.kws("on", "block"), field("name", $.identifier)),

  // { ON BLOCK block }
  on_parameter_spec: $ =>
    seq(...gen.kws("on"), field("name", $.identifier)),

  // { ON END OF selcrit }
  on_end_of_parameter_spec: $ =>
    seq(...gen.kws("on", "end", "of"), field("name", $.identifier)),

  // { ON VALUE-REQUEST }
  //   FOR {para|selcrit-low|selcrit-high} }
  on_value_request_spec: $ =>
    seq(...gen.kws("on", "value-request"), $.__help_or_value_request_target),

  // { ON HELP-REQUEST }
  //   FOR {para|selcrit-low|selcrit-high} }
  on_help_request_spec: $ =>
    seq(...gen.kws("on", "help-request"), $.__help_or_value_request_target),

  // FOR {para|selcrit-low|selcrit-high}
  __help_or_value_request_target: $ =>
    seq(
      gen.kw("for"),
      field("name", choice($.identifier, $.component_selection)),
    ),
};
