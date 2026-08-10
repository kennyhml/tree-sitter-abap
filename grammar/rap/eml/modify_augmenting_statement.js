module.exports = {
  /*
   * MODIFY AUGMENTING { ENTITY bdef operations [RELATING TO orig BY rela] }
   *                  | { ENTITIES OF bdef ENTITY bdef1 operations [...] }.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMODIFY_AUG_ENTITY_ENTITIES.html
   */
  modify_augmenting_statement: $ =>
    seq(
      choice(
        $.__modify_augmenting_short_form_prefix,
        $.__modify_augmenting_long_form_prefix,
      ),
      ".",
    ),

  __modify_augmenting_short_form_prefix: $ =>
    seq(...gen.kws("modify", "augmenting"), $.augmented_modify_entity_spec),

  __modify_augmenting_long_form_prefix: $ =>
    seq(
      ...gen.kws("modify", "augmenting", "entities", "of"),
      field("business_object", $.business_object),
      repeat1($.augmented_modify_entity_spec),
    ),

  augmented_modify_entity_spec: $ =>
    seq(
      gen.kw("entity"),
      field("entity", $.business_object),
      field("operations", optional($.augmented_modify_entity_operations)),
    ),

  augmented_modify_entity_operations: $ =>
    repeat1(
      seq(
        choice(
          $.create_entity,
          $.create_by_association,
          $.update_entity,
          $.delete_entity,
          $.execute_action,
        ),
        optional($.relating_to_spec),
      ),
    ),

  relating_to_spec: $ =>
    seq(
      ...gen.kws("relating", "to"),
      field("origin", $.expression),
      gen.kw("by"),
      field("relation", $.expression),
    ),
};
