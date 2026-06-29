TRY.
    DATA(lo_sdk_islm_api) = cl_aic_islm_compl_api_factory=>get( )->create_instance( islm_scenario = lv_scenario_name ).
    DATA(lo_message_container) = lo_sdk_islm_api->create_message_container( ).

    lo_message_container->set_system_role( 'You are santa claus' ).
    lo_message_container->add_user_message( message = 'What present would you recommend for an ABAP developer?'  ).

    DATA(lo_parameter_setter) = lo_sdk_islm_api->get_parameter_setter( ).
    lo_parameter_setter->set_temperature( '0.8' ).
    lo_parameter_setter->set_maximum_tokens( 1000 ).

    DATA(lo_response) = lo_sdk_islm_api->execute_for_messages( messages = lo_message_container ).
    DATA(lv_response) = lo_response->get_completion( ).
    DATA(lv_status) = 'S'.

  CATCH cx_aic_api_factory INTO DATA(lx_factory).

    lv_response = lx_factory->get_text( ).
    lv_status = 'E'.
  CATCH cx_aic_completion_api INTO DATA(lx_completion).
    lv_response = lx_completion->get_text( ).
    lv_status = 'E'.
  CATCH cx_aic_prompt_template INTO DATA(lx_prompt_template).
    lv_response = lx_prompt_template->get_text( ).
    lv_status = 'E'.
ENDTRY.

cl_demo_output=>display_text( text = lv_response ).
