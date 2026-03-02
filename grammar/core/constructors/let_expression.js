


module.exports = {

    /**
     *  ... LET {var1 = rhs1}|{<fs1> = wrexpr1} 
     *          {var2 = rhs2}|{<fs2> = wrexpr2} 
     *  ... IN ...
     * 
     * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPLET.html
     */
    let_expression: $ => seq(
        gen.kw("let"),
        repeat1($.assignment),
        gen.kw("in")
    )
}