module.exports = {
  read_only: _ => gen.kw("read-only"),

  // Reference to a business object entity, path, or named behavior component.
  business_object: $ =>
    choice(
      $.identifier,
      $.association_navigation,
      $.composition_navigation,
      alias($.__business_object_component_selection, $.component_selection),
    ),

  __business_object_component_selection: $ =>
    seq(
      field("subject", $.identifier),
      field("selector", token.immediate("~")),
      field("component", $._immediate_identifier),
    ),

  association_navigation: $ =>
    seq(
      choice(
        seq(
          field(
            "source",
            choice(
              $.composition_navigation,
              $.association_navigation,
              $.identifier,
            ),
          ),
          token.immediate("\\"),
        ),
        "\\",
      ),
      field("association", $._immediate_identifier),
    ),

  composition_navigation: $ =>
    seq(
      field("source", choice($.composition_navigation, $.identifier)),
      token.immediate("\\\\"),
      field("composition", $._immediate_identifier),
    ),

  // ... FOR CREATE bdef [\_assoc] ...
  for_create_spec: $ =>
    seq(
      ...gen.kws("for", "create"),
      field("business_object", $.business_object),
    ),

  // ... FOR UPDATE bdef ...
  for_update_spec: $ =>
    seq(
      ...gen.kws("for", "update"),
      field("business_object", $.business_object),
    ),

  // ... FOR DELETE bdef ...
  for_delete_spec: $ =>
    seq(
      ...gen.kws("for", "delete"),
      field("business_object", $.business_object),
    ),
};
