OPEN DATASET file FOR INPUT IN BINARY MODE MESSAGE msg.
"            ^ variable
"                                                   ^ variable

OPEN DATASET 'test.dat' TYPE attrs FOR OUTPUT
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
