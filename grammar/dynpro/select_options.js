import { chainable } from "../helpers/decl_gen.js";
import { kw, kws } from '../helpers/keywords.js'

export default {

    select_options_declaration: $ => chainable(
        "select-options", $.select_options_spec
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECT-OPTIONS.html
    select_options_spec: $ => seq(
        field("name", $.identifier),
        kw("for"),
        field("for", choice(
            $.dyn_spec,
            $.named_data_object
        )),
        repeat(
            choice(
                $.__selopt_screen_option,
                $.__selopt_value_option,
            )
        )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECT-OPTIONS_SCREEN.html
    __selopt_screen_option: $ => choice(
        field("visible_length", $.visible_length_spec),
        field("extension", $.no_extension_spec),
        field("intervals", $.no_intervals_spec),

        field("obligatory", $.obligatory_spec),
        field("display", $.no_display_spec),
        field("modif_id", $.modif_id_spec),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECT-OPTIONS_VALUE.html
    __selopt_value_option: $ => choice(
        field("default", $.default_value_spec),
        field("default", $.default_range_spec),
        field("case", $.lower_case_spec),
        field("search_help", $.search_help_spec),
        field("memory_id", $.memory_id_spec),
    ),

    default_range_spec: $ => seq(
        kw("default"),
        field("low", $.data_object),
        repeat1(
            choice(
                seq(kw("to"), field("high", $.data_object)),
                seq(kw("option"), field("option", $._comparison_operator)),
                seq(kw("sign"), field("sign", choice(...kws("i", "e")))),
            )
        )
    ),

    no_extension_spec: _ => kw("no-extension"),
}