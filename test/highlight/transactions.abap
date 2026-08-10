CALL TRANSACTION 'SE24' WITH AUTHORITY-CHECK.
"                  ^ string.special.symbol
CALL TRANSACTION transaction WITHOUT AUTHORITY-CHECK.
"                  ^ variable
LEAVE TO TRANSACTION 'SE24'.
"                      ^ string.special.symbol
LEAVE TO TRANSACTION transaction.
"                      ^ variable
