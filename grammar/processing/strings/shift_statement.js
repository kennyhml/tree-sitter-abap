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
  ...gen.periodTerminated("shift_statement", $ =>
    seq(
      gen.kw("shift"),
      field("subject", $.data_object),
      repeat($.__shift_addition),
    ),
  ),

  __shift_addition: $ =>
    choice(
      $.shift_direction,
      $.shift_left_deleting,
      $.shift_right_deleting,
      $.shift_by,
      $.shift_up_to,
      $._processing_mode_spec,
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_PLACES.html
  shift_by: $ =>
    seq(gen.kw("by"), field("amount", $.numeric_expression), gen.kw("places")),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_PLACES.html
  shift_up_to: $ =>
    seq(
      ...gen.kws("up", "to"),
      field("substring", $.character_like_expression),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DIRECTION.html
  shift_direction: $ =>
    prec.right(repeat1(choice($.left, $.right, $.circular))),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DELETING.html
  shift_left_deleting: $ =>
    seq(
      ...gen.kws("left", "deleting", "leading"),
      field("mask", $.character_like_expression),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DELETING.html
  shift_right_deleting: $ =>
    seq(
      ...gen.kws("right", "deleting", "trailing"),
      field("mask", $.character_like_expression),
    ),

  circular: _ => gen.kw("circular"),
  left: _ => gen.kw("left"),
  right: _ => gen.kw("right"),
};
