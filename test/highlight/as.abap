OPEN DATASET file FOR INPUT IN BINARY MODE MESSAGE msg.
"            ^ variable
"                                                   ^ variable

OPEN DATASET 'test.dat' TYPE attrs FOR OUTPUT
"             ^ string.special.path
"                            ^ variable
  IN TEXT MODE ENCODING UTF-8 WITH BYTE-ORDER MARK
  MESSAGE FINAL(message).
"               ^ variable

OPEN DATASET file FOR UPDATE IN LEGACY TEXT MODE
"            ^ variable
  CODE PAGE code_page
"           ^ variable
  WITH SMART LINEFEED
  AT POSITION position
"             ^ variable
  REPLACEMENT CHARACTER replacement
"                       ^ variable
  IGNORING CONVERSION ERRORS
  MESSAGE msg.
"         ^ variable

OPEN DATASET file FOR OUTPUT IN BINARY MODE FILTER command.
"            ^ variable
"                                                   ^ variable

TRANSFER payload
"        ^ variable
  TO file
"    ^ variable
  LENGTH transfer_length
"        ^ variable
  NO END OF LINE.

TRANSFER payload TO 'test.dat'.
"                    ^ string.special.path

READ DATASET file
"            ^ variable
  INTO buffer
"      ^ variable
  MAXIMUM LENGTH maximum_length
"                 ^ variable
  ACTUAL LENGTH actual_length.
"               ^ variable

READ DATASET 'test.dat' INTO buffer.
"             ^ string.special.path

GET DATASET file
"           ^ variable
  POSITION FINAL(position)
"                ^ variable
  ATTRIBUTES attributes.
"            ^ variable

GET DATASET 'test.dat'.
"            ^ string.special.path

SET DATASET file
"           ^ variable
  POSITION position
"          ^ variable
  ATTRIBUTES attributes.
"            ^ variable

SET DATASET 'test.dat'.
"            ^ string.special.path

TRUNCATE DATASET file
"                ^ variable
  AT POSITION position.
"             ^ variable

TRUNCATE DATASET 'test.dat' AT CURRENT POSITION.
"                 ^ string.special.path

DELETE DATASET file.
"              ^ variable

DELETE DATASET 'test.dat'.
"               ^ string.special.path

CLOSE DATASET file.
"             ^ variable

CLOSE DATASET 'test.dat'.
"              ^ string.special.path

CALL system_function
"    ^ variable
  ID 'FOO'
"    ^ string.special.symbol
  FIELD value.
"       ^ variable

CALL system_function
"    ^ variable
  ID parameter_id
"    ^ variable
  FIELD value.
"       ^ variable
