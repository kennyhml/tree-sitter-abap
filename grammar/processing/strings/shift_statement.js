module.exports = {
  /**
   * SHIFT dobj [ {[places][direction]} | deleting]
   *              [IN {CHARACTER|BYTE} MODE].
   *
   * Expanded:
   *
   * SHIFT dobj [ { [ BY num places / UP to subrstring][LEFT / RIGHT [CIRCULAR] ] }
   *              / [ LEFT DELETING TRAILING / RIGHT DELEATING LEADING ] mask ]
   *              [IN {CHARACTER|BYTE} MODE].
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT.html
   */
  shift_statement: $ => seq($.__shift_statement_prefix, "."),

  __shift_statement_prefix: $ =>
    seq(
      gen.kw("shift"),
      field(
        "subject",
        choice($._contextual_identifier, $._modifiable_target),
      ),
      repeat($.__shift_addition),
    ),

  __shift_addition: $ =>
    choice(
      $.shift_direction_spec,
      $.shift_left_deleting_spec,
      $.shift_right_deleting_spec,
      $.shift_by_spec,
      $.shift_up_to_spec,
      $._processing_mode_spec,
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_PLACES.html
  shift_by_spec: $ =>
    seq(gen.kw("by"), field("amount", $._numeric_position), gen.kw("places")),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_PLACES.html
  shift_up_to_spec: $ =>
    seq(
      ...gen.kws("up", "to"),
      field("substring", $._character_position),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DIRECTION.html
  shift_direction_spec: $ =>
    prec.right(repeat1(choice($.left, $.right, $.circular))),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DELETING.html
  shift_left_deleting_spec: $ =>
    seq(
      ...gen.kws("left", "deleting", "leading"),
      field("mask", $._character_position),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DELETING.html
  shift_right_deleting_spec: $ =>
    seq(
      ...gen.kws("right", "deleting", "trailing"),
      field("mask", $._character_position),
    ),

  circular: _ => gen.kw("circular"),
  left: _ => gen.kw("left"),
  right: _ => gen.kw("right"),
};
