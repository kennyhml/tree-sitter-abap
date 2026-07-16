CLASS class DEFINITION FOR TESTING 
  RISK LEVEL CRITICAL
  DURATION SHORT.

  PRIVATE SECTION.    
    methods test_class1 FOR TESTING.

ENDCLASS.

CLASS mock_server DEFINITION FOR TESTING FINAL. 
  PUBLIC SECTION. 
    INTERFACES if_http_server PARTIALLY IMPLEMENTED. 
ENDCLASS. 

TEST-SEAM seam.
"<- keyword
"         ^ constant
END-TEST-SEAM.
"<- keyword

TEST-INJECTION seam.
"<- keyword
"              ^ constant
END-TEST-INJECTION.
"<- keyword
