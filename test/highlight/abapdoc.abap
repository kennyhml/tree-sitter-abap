"! This documents some code
" ^ comment.documentation
"! @parameter foo | Some useless parameter
"   ^ keyword.directive
"             ^ variable.parameter
"                    ^ comment.documentation
"! @raising bar | Some exception type
"   ^ keyword.directive
"             ^ type
"                    ^ comment.documentation
"! @exception baz | Some exception parameter
"   ^ keyword.directive
"             ^ variable.parameter
"                    ^ comment.documentation
"! @brief This is a brief description using a custom tag
"   ^ keyword.directive
"         ^ comment.documentation
"! @testing demo_trafo 
"   ^ keyword.directive
"           ^ type
"! @testing FUGR:MY_FUNCTION_GROUP 
"   ^ keyword.directive
"! {@link .cl_order.METH:show} 
"  ^ punctuation.special
"   ^ keyword.directive
"          ^ type
"                   ^ keyword.directive
"                        ^ function.method
"! {@link cl_abap_browser.METH:show_html.DATA:html_string}.
"         ^ type
"                         ^ keyword.directive
"                              ^ function.method
"                                        ^ keyword.directive
"                                             ^ variable
"! {@link DOMA:/AIF/ACTIONNR}.
"         ^ keyword.directive
"              ^ type
"! {@link FUGR:CRM_ORDER_MAINTAIN}.
"         ^ keyword.directive
"              ^ type
