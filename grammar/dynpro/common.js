import { kw, kws } from '../helpers/keywords.js';

export default {

    modif_id_spec: $ => seq(
        ...kws("modif", "id"),
        field("id", $.identifier)
    ),

    default_value_spec: $ => seq(
        kw("default"),
        field("value", $.data_object)
    ),

    visible_length_spec: $ => seq(
        ...kws("visible", "length"),
        field("length", $.number)
    ),

    memory_id_spec: $ => seq(
        ...kws("memory", "id"),
        field("id", $.identifier)
    ),

    search_help_spec: $ => seq(
        ...kws("matchcode", "object"),
        field("name", $.identifier)
    ),

    user_command_spec: $ => seq(
        kw("user-command"),
        field("command", $.identifier)
    ),

    lower_case_spec: _ => seq(...kws("lower", "case")),

    obligatory_spec: _ => kw("obligatory"),

    no_display_spec: _ => kw("no-display"),

    no_intervals_spec: _ => seq(...kws("no", "intervals")),
}