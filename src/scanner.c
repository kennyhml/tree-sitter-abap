#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"

enum Token
{
    LINE_COMMENT,

    MULTI_LINE_COMMENT,

    DOCSTRING,

    WHITESPACE,
    /**
     * Tree sitter first calls the external scanner during error recovery, the
     * error sentinel allows us to check whether we are currently in recovery
     * mode. It is not a token that will ever actually be emitted.
     *
     * https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html#other-external-scanner-details
     */
    ERROR_SENTINEL
};

typedef struct
{
    bool placeholder;
} Scanner;

bool is_at_comment_start(TSLexer* lexer)
{
    return lexer->get_column(lexer) == 0 && lexer->lookahead == '*';
}

bool consume_docstring_start(TSLexer* lexer)
{
    if (lexer->lookahead != '"') {
        return false;
    }
    lexer->advance(lexer, false);
    if (lexer->lookahead != '!') {
        return false;
    }
    lexer->advance(lexer, false);
    return true;
}

void skip_all_whitespaces(TSLexer* lexer)
{
    while (lexer->lookahead == ' ' || lexer->lookahead == '\v' ||
           lexer->lookahead == '\f' || lexer->lookahead == '\t') {
        // The whitespaces need to be part of the token for docstrings,
        // otherwise it gets cut into little parts.
        lexer->advance(lexer, false);
    }
}

bool consume_end_of_line(TSLexer* lexer)
{
    if (lexer->lookahead == '\n') {
        lexer->advance(lexer, false);
        return true;
    }

    if (lexer->lookahead == '\r') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == '\n') {
            lexer->advance(lexer, false);
        }
        return true;
    }
    return false;
}

/**
 * Hook to implement our scanner logic in.
 *
 * @returns true if a token was found, false otherwise.
 */
bool tree_sitter_abap_external_scanner_scan(void* payload, TSLexer* lexer,
                                            const bool* valid_symbols)
{
    if (valid_symbols[ERROR_SENTINEL]) {
        return false;
    }

    if (valid_symbols[WHITESPACE]) {
        if (lexer->lookahead == '\r' || lexer->lookahead == '\n' ||
            lexer->lookahead == '\v' || lexer->lookahead == '\f') {
            lexer->result_symbol = WHITESPACE;
            if (lexer->lookahead == '\r') {
                lexer->advance(lexer, false);
                if (lexer->lookahead == '\n') {
                    lexer->advance(lexer, false);
                }
            } else {
                lexer->advance(lexer, false);
            }
            return true;
        }

        bool has_whitespace = false;
        while (lexer->lookahead == ' ') {
            lexer->advance(lexer, true);
            has_whitespace = true;
        }
        if (has_whitespace) {
            lexer->result_symbol = WHITESPACE;
            lexer->mark_end(lexer);
            return true;
        }
    }

    if (valid_symbols[LINE_COMMENT]) {
        uint32_t lines = 0;
        while (is_at_comment_start(lexer)) {
            // We are at at least one line comment
            do {
                lexer->advance(lexer, false);
            } while (!lexer->eof(lexer) && !consume_end_of_line(lexer));
            lines++;
        }
        if (lines != 0) {
            lexer->result_symbol =
                    lines > 1 ? MULTI_LINE_COMMENT : LINE_COMMENT;
            lexer->mark_end(lexer);
            return true;
        }
        // we didnt need to consume anything to check line comment so its safe
        // to continue
    }

    if (valid_symbols[DOCSTRING]) {
        uint32_t lines = 0;
        while (consume_docstring_start(lexer)) {
            do {
                lexer->advance(lexer, false);
            } while (!lexer->eof(lexer) && !consume_end_of_line(lexer));
            // Docstrings may be indented, so we need to make sure to skip
            // whitespaces prior to checking if another docstring starts.
            skip_all_whitespaces(lexer);
            lines++;
        }
        if (lines != 0) {
            lexer->result_symbol = DOCSTRING;
            lexer->mark_end(lexer);
        }
        // we might have consumed a token while checking. not safe to continue
        return lines != 0;
    }
    return false;
}


/**
 * Called when the scanner is created so we can allocate context memory.
 *
 * https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html#create
 */
void* tree_sitter_abap_external_scanner_create()
{
    return ts_calloc(1, sizeof(Scanner));
}

/**
 * Called when the scanner is destroyed so we can free the context memory.
 *
 * https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html#destroy
 */
void tree_sitter_abap_external_scanner_destroy(void* payload)
{
    ts_free(payload);
}


/**
 * Called when the scanner identifies a token, should copy our context
 * into the given buffer and return the number of bytes written.
 *
 * This is used to store the state of the scanner and then restore it later on.
 *
 * Its on us to implement the (de)serialization efficiently and correctly.
 *
 * https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html#serialize
 */
unsigned tree_sitter_abap_external_scanner_serialize(void* payload,
                                                     char* buffer)
{
    Scanner* scanner = (Scanner*)payload;
    buffer[0] = (char)scanner->placeholder;
    return 1;
}

/**
 * Counterpart to the serializer.
 *
 * https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html#deserialize
 */
void tree_sitter_abap_external_scanner_deserialize(void* payload,
                                                   const char* buffer,
                                                   unsigned length)
{
    Scanner* scanner = (Scanner*)payload;
    if (length > 0) {
        scanner->placeholder = buffer[0];
    }
}
