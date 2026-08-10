module.exports = {
  /**
   * MESSAGE { msg | text }
   *         {  { [DISPLAY LIKE dtype] [WITH dobj1 ... dobj4] }
   *         /  { [DISPLAY LIKE dtype] [WITH dobj1 ... dobj4] RAISING exception }
   *         /  {                      [WITH dobj1 ... dobj4] INTO text } }.
   *
   * Things to note here:
   * - 'MESSAGE oref' and 'MESSAGE text' have identical syntax and are ambiguous.
   * - Names of standard message classes may be fully numeric, e.g '00' or '55'
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapmessage.html
   */
  message_statement: $ => seq($.__message_statement_prefix, "."),

  __message_statement_prefix: $ =>
    gen.chainable("message", $.message_spec),

  /**
   * A message specification that is inlined into another statement, e.g
   * a {@link throw_exception} or {@link raise_exception} and preceded by
   * a 'message' keyword that doesnt technically serve as a statement.
   */
  inline_message: $ => seq(gen.kw("message"), $.message_spec),

  message_spec: $ =>
    prec.right(
      2,
      seq(
        choice(
          $.__compact_message_id,
          $.__long_form_message_id,
          // message from an exception object or character-like data object
          seq(
            choice(
              field("text", choice($.string_literal, $.field_symbol)),
              field("source", $._character_position),
            ),
            optional($.__message_type_spec),
          ),
        ),
        repeat($.__message_addition),
      ),
    ),

  raising_exception_spec: $ =>
    seq(gen.kw("raising"), field("exception", $.identifier)),

  display_like_spec: $ =>
    seq(...gen.kws("display", "like"), field("type", $._simple_operand)),

  with_arguments_spec: $ =>
    seq(gen.kw("with"), prec.right(repeat1($.expression))),

  __message_addition: $ =>
    choice(
      $.display_like_spec,
      $.with_arguments_spec,
      alias($._writable_into_spec, $.into_spec),
      $.raising_exception_spec,
    ),

  /**
   * Compact specification of a message type, number and optionally, the ID.
   *
   * For example, i333(zmessages) represents message nr. 333 as type 'I' of
   * message class zmessages, where the message class id can be omitted if
   * its already set at a program level.
   */
  __compact_message_id: $ =>
    seq(
      // could not find a way to do this without help from an
      // external scanner due to how grouping into word tokens
      // behaves during lexing.
      field("type", $.message_type),
      field("number", $._immediate_number),

      // Optional if specified at program level
      optional(
        gen.immediateTightParens(
          field("id", choice($._immediate_identifier, $._immediate_number)),
        ),
      ),
    ),

  /**
   * Long form specification of a message type, number and ID where each
   * can also be specified dynamically through the value of a data object.
   *
   * For example: ... ID zmessages type I number 333 ...
   */
  __long_form_message_id: $ =>
    seq(
      gen.kw("id"),
      field("id", $._simple_operand),

      // Not technically optional, but theres not really any ambiguity in
      // this context and it makes highlighting smoother..
      optional($.__message_type_spec),
      optional(seq(gen.kw("number"), field("number", $._simple_operand))),
    ),

  __message_type_spec: $ => seq(gen.kw("type"), field("type", $._simple_operand)),
};
