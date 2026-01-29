#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"
#include <wctype.h>

enum Token
{
    LINE_COMMENT,

    MULTI_LINE_COMMENT,

    DOCSTRING_CONTINUATION,

    DOCTAG_TEXT,

    /**
     * Message type can be the prefix of a message number, and this conflicts
     * with the word rule. There might be a better way to work around this, but
     * I could not find one.
     */
    MESSAGE_TYPE,

    ERROR_SENTINEL
};

typedef struct
{
    bool placeholder;
} Scanner;

// i: information message
// s: status message
// e: error message
// w: warning message
// a: terminate message
// x: exit message
static const char* valid_message_types = "isewaxISEWAX";

int32_t advance_whitespaces(TSLexer* lexer, bool include)
{
    int32_t consumed = 0;
    while (lexer->lookahead == ' ' || lexer->lookahead == '\v' ||
           lexer->lookahead == '\f' || lexer->lookahead == '\t') {
        // The whitespaces need to be part of the token for docstrings,
        // otherwise it gets cut into little parts.
        lexer->advance(lexer, !include);
        consumed++;
    }
    return consumed;
}

bool consume_end_of_line(TSLexer* lexer, bool include)
{
    if (lexer->lookahead == '\n') {
        lexer->advance(lexer, !include);
        return true;
    }

    if (lexer->lookahead == '\r') {
        lexer->advance(lexer, !include);
        if (lexer->lookahead == '\n') {
            lexer->advance(lexer, !include);
        }
        return true;
    }
    return false;
}

bool consume_docstring_start(TSLexer* lexer, bool include)
{
    if (lexer->lookahead != '"') {
        return false;
    }
    lexer->advance(lexer, !include);
    if (lexer->lookahead != '!') {
        return false;
    }
    lexer->advance(lexer, !include);
    return true;
}

bool is_at_line_comment_start(TSLexer* lexer)
{
    return lexer->get_column(lexer) == 0 && lexer->lookahead == '*';
}

// We must make whitespaces an inline regex in the extras to avoid it
// rendering the immediate token enforcement useless (does not work in
// rules / external scanner). Unfortunately, that also causes the parser
// to not give control to the scanner in alot of scenarios and causes
// failure to check whether a line comment is starting at any
// opportunity. Due to the 'magical' nature of the scanner, im still not
// fully sure what is actually going on.
void advance_whitespaces_and_newlines(TSLexer* lexer, bool include)
{
    while (advance_whitespaces(lexer, include) > 0 ||
           consume_end_of_line(lexer, include)) {
    }
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

    if (valid_symbols[MESSAGE_TYPE]) {
        advance_whitespaces_and_newlines(lexer, false);

        // For now, literally just allow any character to be more permissive.
        // The restrictive logic is there if we need it..
        if (iswalpha(lexer->lookahead)) {
            lexer->advance(lexer, false);
            lexer->mark_end(lexer);
            if (!iswdigit(lexer->lookahead)) {
                return false;
            }
            lexer->result_symbol = MESSAGE_TYPE;
            return true;
        }
    }

    if (valid_symbols[DOCSTRING_CONTINUATION]) {
        consume_end_of_line(lexer, false);

        // start of the next line, "! must appear
        advance_whitespaces(lexer, false);
        if (consume_docstring_start(lexer, true)) {
            lexer->result_symbol = DOCSTRING_CONTINUATION;
            return true;
        }
        return false;
    }

    if (valid_symbols[DOCTAG_TEXT]) {
        bool start_capture = false;

        // simply walk up to the end of the line or until the @ symbol.
        while (!lexer->eof(lexer) && lexer->lookahead != '\r' &&
               lexer->lookahead != '\n' && lexer->lookahead != '@') {
            start_capture |= lexer->lookahead != ' ';
            lexer->advance(lexer, !start_capture);
        }
        if (start_capture) {
            lexer->result_symbol = DOCTAG_TEXT;
        }
        return start_capture;
    }

    if (valid_symbols[LINE_COMMENT]) {
        uint32_t lines = 0;
        // make sure the advanced whitespaces and newlines are not included
        // in the range.
        advance_whitespaces_and_newlines(lexer, false);
        while (is_at_line_comment_start(lexer)) {
            do {
                lexer->advance(lexer, false);
                if (lexer->lookahead != ' ') {
                    lexer->mark_end(lexer);
                }
            } while (!lexer->eof(lexer) && !consume_end_of_line(lexer, true));
            lines++;
        }
        if (lines != 0) {
            lexer->result_symbol =
                    lines > 1 ? MULTI_LINE_COMMENT : LINE_COMMENT;
            return true;
        }
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
 * This is used to store the state of the scanner and then restore it later
 * on.
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
