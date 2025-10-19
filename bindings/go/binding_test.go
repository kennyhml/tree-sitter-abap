package tree_sitter_abap_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_abap "github.com/kennyhml/tree-sitter-abap/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_abap.Language())
	if language == nil {
		t.Errorf("Error loading Abap grammar")
	}
}
