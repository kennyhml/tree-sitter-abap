import XCTest
import SwiftTreeSitter
import TreeSitterAbap

final class TreeSitterAbapTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_abap())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Abap grammar")
    }
}
