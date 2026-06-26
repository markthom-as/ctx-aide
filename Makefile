.PHONY: validate ctx-lint ctx-test future-check skill-validate install-skill

CODEX_SKILLS_DIR ?= $(HOME)/.codex/skills

validate: ctx-lint ctx-test future-check skill-validate

ctx-lint:
	node tools/context/ctx.mjs lint --json

ctx-test:
	node tools/context/ctx.test.mjs

future-check:
	node tools/context/ctx.mjs future check --json

skill-validate:
	python3 /Users/jove/code/codex-skills/skills/.system/skill-creator/scripts/quick_validate.py skills/repo-context

install-skill: skill-validate
	mkdir -p "$(CODEX_SKILLS_DIR)"
	rm -rf "$(CODEX_SKILLS_DIR)/repo-context"
	cp -R skills/repo-context "$(CODEX_SKILLS_DIR)/repo-context"
	python3 /Users/jove/code/codex-skills/skills/.system/skill-creator/scripts/quick_validate.py "$(CODEX_SKILLS_DIR)/repo-context"
