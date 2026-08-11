module.exports = {
  /*
   * IMPORT DIRECTORY INTO itab
   *  FROM DATABASE dbtab(ar) [TO wa] [CLIENT cl] ID id.
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPIMPORT_DIRECTORY.html
   */
  import_directory_statement: $ =>
    seq($.__import_directory_statement_prefix, "."),

  __import_directory_statement_prefix: $ =>
    seq(
      ...gen.kws("import", "directory"),
      alias($.__import_directory_into_spec, $.into_spec),
      $.import_from_database_spec,
    ),

  __import_directory_into_spec: $ =>
    seq(gen.kw("into"), field("destination", $._write_target)),

  import_from_database_spec: $ =>
    seq(
      ...gen.kws("from", "database"),
      $._data_cluster_table_area,
      optional($.data_cluster_to_spec),
      optional($.data_cluster_client_spec),
      $.data_cluster_id_spec,
    ),
};
