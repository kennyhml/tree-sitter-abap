import { kw, kws } from "../../helpers/keywords.js"

export default {

    /**
     * TRY. 
     *   [try_block] 
     * [CATCH [BEFORE UNWIND] cx_class1 cx_class2 ... [INTO oref]. 
     *   [catch_block]] 
     * ... 
     * [CLEANUP [INTO oref]. 
     *   [cleanup_block]] 
     * ENDTRY.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTRY.html
     */
    try_statement: $ => seq(
        kw("try"), ".",
        optional(field("body", alias($.statement_block, $.try_block))),
        repeat($.catch_clause),
        optional(field("cleanup", $.cleanup_clause)),
        kw("endtry"), "."
    ),

    /**
     * CATCH [BEFORE UNWIND] cx_class1 cx_class2 ... [INTO oref].
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCATCH_TRY.html
     */
    catch_clause: $ => seq(
        kw("catch"),
        optional($.before_unwind_spec),
        field("exceptions", $.catch_exception_list),
        optional($.catch_into_spec),
        ".",
        optional(field("body", alias($.statement_block, $.catch_block))),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLEANUP.html
    cleanup_clause: $ => seq(
        kw("cleanup"),
        optional($.catch_into_spec),
        ".",
        optional(field("body", alias($.statement_block, $.cleanup_block))),
    ),

    before_unwind_spec: _ => seq(
        ...kws("before", "unwind")
    ),

    catch_into_spec: $ => seq(
        kw("into"),
        field("target", choice(
            $.named_data_object,
            $.declaration_expression
        ))
    ),

    catch_exception_list: $ => repeat1($.identifier),
}