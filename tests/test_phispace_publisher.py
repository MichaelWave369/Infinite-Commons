"""Fail-closed review and explicit local export tests for PhiSpace publishing."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import pytest

from infinite_commons.phispace_publisher import (
    DRAFT_SCHEMA,
    MAX_BYTES,
    PUBLIC_SCHEMA,
    PUBLICATION_MODE,
    PublicationRejected,
    canonical_artifact,
    export_approved,
    main,
    read_draft,
    validate_draft,
)

EXAMPLE = Path(__file__).parent / "fixtures/phispace/manual_public_draft.json"


def _draft() -> dict:
    return json.loads(EXAMPLE.read_text(encoding="utf-8"))


def test_preview_returns_exact_public_bytes_and_not_a_file(tmp_path: Path, capsys) -> None:
    draft = tmp_path / "public-draft.json"
    draft.write_text(EXAMPLE.read_text(encoding="utf-8"), encoding="utf-8")
    assert main(["preview", "--draft", str(draft)]) == 0
    captured = capsys.readouterr()
    assert "REVIEW ALL PUBLIC FIELDS" in captured.out
    assert "NOT an identity or consent signature" in captured.out
    assert '"visibility": "public"' in captured.out
    assert '"publication_mode": "owner-curated-export"' in captured.out
    assert re.search(r"SHA256: [0-9a-f]{64}", captured.out)
    assert list(tmp_path.iterdir()) == [draft]


def test_export_exact_digest_explicit_approval_and_create_only(tmp_path: Path, capsys) -> None:
    draft = tmp_path / "manual.json"
    draft.write_text(EXAMPLE.read_text(encoding="utf-8"), encoding="utf-8")
    payload, digest = canonical_artifact(read_draft(draft))
    output = tmp_path / "approved-public.json"

    assert main(
        ["export", "--draft", str(draft), "--out", str(output), "--approve-sha256", digest]
    ) == 2
    assert not output.exists()
    assert "--confirm-public" in capsys.readouterr().err

    assert main(
        ["export", "--draft", str(draft), "--out", str(output),
         "--approve-sha256", "0" * 64, "--confirm-public"]
    ) == 2
    assert not output.exists()
    assert "mismatched" in capsys.readouterr().err

    assert main(
        ["export", "--draft", str(draft), "--out", str(output),
         "--approve-sha256", digest, "--confirm-public"]
    ) == 0
    assert output.read_bytes() == payload
    assert hashlib.sha256(output.read_bytes()).hexdigest() == digest
    public = json.loads(output.read_text(encoding="utf-8"))
    assert public["schema"] == PUBLIC_SCHEMA
    assert public["visibility"] == "public"
    assert public["publication_mode"] == PUBLICATION_MODE
    assert public["space_id"] == "phispace.lantern-room"
    assert "LOCAL ARTIFACT CREATED" in capsys.readouterr().out

    assert main(
        ["export", "--draft", str(draft), "--out", str(output),
         "--approve-sha256", digest, "--confirm-public"]
    ) == 2
    assert output.read_bytes() == payload
    assert "refusing overwrite" in capsys.readouterr().err


def test_changed_draft_invalidates_prior_approval(tmp_path: Path, capsys) -> None:
    source = tmp_path / "manual.json"
    original = _draft()
    source.write_text(json.dumps(original), encoding="utf-8")
    _, digest = canonical_artifact(read_draft(source))
    original["profile"]["tagline"] = "Changed after preview"
    source.write_text(json.dumps(original), encoding="utf-8")
    output = tmp_path / "result.json"
    assert main(
        ["export", "--draft", str(source), "--out", str(output),
         "--approve-sha256", digest, "--confirm-public"]
    ) == 2
    assert "mismatched" in capsys.readouterr().err
    assert not output.exists()


@pytest.mark.parametrize(
    "mutation",
    [
        lambda x: x.update({"schema": "unknown"}),
        lambda x: x.update({"visibility": "public"}),
        lambda x: x.update({"private_path": "/Users/me/secret"}),
        lambda x: x.update({"space_id": "../../sensitive"}),
        lambda x: x.update({"space_id": "phispace.example/../"}),
        lambda x: x["profile"].update({"email": "private@example.invalid"}),
        lambda x: x["profile"].update({"welcome": ""}),
        lambda x: x["profile"].update({"welcome": "a" * 501}),
        lambda x: x["profile"].update({"welcome": "\u202esecret"}),
        lambda x: x["sections"].append(x["sections"][0].copy()),
        lambda x: x["sections"].clear(),
        lambda x: x["sections"][0].update({"kind": "exec"}),
        lambda x: x["sections"][0].update({"url": "http://example.invalid"}),
        lambda x: x["sections"][0].update({"body": "\nunsafe"}),
        lambda x: x["sections"][0].update({"id": "../outside"}),
        lambda x: x.update({"sections": "not-an-array"}),
    ],
)
def test_rejects_unreviewed_fields_and_bad_content(mutation) -> None:
    draft = _draft()
    mutation(draft)
    with pytest.raises(PublicationRejected):
        validate_draft(draft)


def test_only_allowlisted_fields_make_it_into_export() -> None:
    output = validate_draft(_draft())
    assert output["schema"] == PUBLIC_SCHEMA
    assert output["publication_mode"] == PUBLICATION_MODE
    assert output["visibility"] == "public"
    assert set(output) == {
        "schema", "space_id", "visibility", "publication_mode", "profile", "sections"
    }
    assert set(output["profile"]) == {"display_name", "tagline", "welcome"}
    assert all(set(section) == {"id", "kind", "title", "body"} for section in output["sections"])
    assert DRAFT_SCHEMA != PUBLIC_SCHEMA


def test_rejects_oversized_source_and_duplicate_json_keys(tmp_path: Path) -> None:
    source = tmp_path / "too-large.json"
    source.write_bytes(b"Z" * (MAX_BYTES + 1))
    with pytest.raises(PublicationRejected, match="16 KiB"):
        read_draft(source)
    source.write_text('{"schema":"one","schema":"two"}', encoding="utf-8")
    with pytest.raises(PublicationRejected, match="duplicate JSON field"):
        read_draft(source)
    source.write_bytes(b"\xff")
    with pytest.raises(PublicationRejected, match="UTF-8"):
        read_draft(source)


def test_rejects_directory_and_source_symlink(tmp_path: Path) -> None:
    with pytest.raises(PublicationRejected):
        read_draft(tmp_path)
    link = tmp_path / "source-link.json"
    try:
        link.symlink_to(EXAMPLE)
    except (OSError, NotImplementedError):
        pytest.skip("symlink creation unavailable")
    with pytest.raises(PublicationRejected, match="non-symlink"):
        read_draft(link)


def test_rejects_bad_output_paths_and_missing_approval(tmp_path: Path) -> None:
    payload, digest = canonical_artifact(read_draft(EXAMPLE))
    with pytest.raises(PublicationRejected, match="directory"):
        export_approved(payload, digest, digest, tmp_path / "missing" / "public.json")
    with pytest.raises(PublicationRejected, match=r"\.json"):
        export_approved(payload, digest, digest, tmp_path / "public.txt")
    with pytest.raises(PublicationRejected, match="mismatched"):
        export_approved(payload, digest, "garbage", tmp_path / "public.json")


def test_canonical_artifact_does_not_exceed_16_kib() -> None:
    artifact, digest = canonical_artifact(validate_draft(_draft()))
    assert len(artifact) <= MAX_BYTES
    assert hashlib.sha256(artifact).hexdigest() == digest
