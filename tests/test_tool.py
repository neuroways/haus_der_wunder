"""Regeltests fuer tools/emfd_media.py:  python3 -m unittest discover -s tests -p 'test_*.py'"""
import copy
import os
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import emfd_media as M  # noqa: E402

# Repo-Aufbau: Medien in media/; Testmanifest (Revision 1, clean) wird von tests/run_tests.sh nach work/ gebaut.
MANIFEST_PATH = Path(os.environ.get("EMFD_TEST_MANIFEST", ROOT / "work/manifest.json"))
MANIFEST = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
SCHEMA = json.loads((ROOT / "media/manifest.schema.json").read_text(encoding="utf-8"))


def codes(doc, release=False):
    return {r["code"] for r in M.validate_manifest(doc, SCHEMA, release) if r["level"] == "error"}


class ValidateTests(unittest.TestCase):
    def test_current_manifest_valid_for_development(self):
        self.assertEqual(codes(MANIFEST), set())

    def test_release_blocks_staged_and_unverified(self):
        c = codes(MANIFEST, release=True)
        self.assertIn("release-staged", c)
        self.assertIn("release-unverified", c)

    def test_o25_rejected(self):
        d = copy.deepcopy(MANIFEST)
        d["cards"]["O25"] = copy.deepcopy(d["cards"]["O24"])
        self.assertTrue({"cards", "schema"} & codes(d))

    def test_test_media_not_in_primary(self):
        d = copy.deepcopy(MANIFEST)
        d["playlists"]["primary"]["items"][-1] = "audio.S01-D-A"
        self.assertIn("test-in-primary", codes(d))

    def test_superseded_front_rejected(self):
        d = copy.deepcopy(MANIFEST)
        d["cards"]["O01"]["front"] = "card.O01.front.r1"
        self.assertIn("front-superseded", codes(d))

    def test_wrong_owner_cover_rejected(self):
        d = copy.deepcopy(MANIFEST)
        d["cards"]["O05"]["cover"] = "card.O04.cover.r1"
        self.assertIn("cover-owner", codes(d))

    def test_parent_path_rejected(self):
        d = copy.deepcopy(MANIFEST)
        d["assets"]["card.O01.front.r2"]["variants"]["view"]["path"] = "../home/x.webp"
        self.assertTrue({"path-form", "schema"} & codes(d))

    def test_duplicate_path_rejected(self):
        d = copy.deepcopy(MANIFEST)
        d["assets"]["card.O02.front.r2"]["variants"]["view"]["path"] = d["assets"]["card.O01.front.r2"]["variants"]["view"]["path"]
        self.assertIn("path-dup", codes(d))

    def test_counts(self):
        core = MANIFEST
        audio = {v["path"] for a in core["assets"].values() if a["role"] == "audio" for v in a["variants"].values()}
        self.assertEqual(len(audio), 35)
        self.assertEqual(len(core["playlists"]["primary"]["items"]), 25)
        self.assertEqual(sorted(core["cards"]), M.CARD_IDS)


class LiveStandTests(unittest.TestCase):
    """Abgleich mit dem Serverbestand 18.11.2026 (live/)."""

    def test_devices_from_live_room_music_map(self):
        for pid in [f"P0{i}" for i in range(1, 9)]:
            d = MANIFEST["devices"][pid]
            self.assertTrue(d.get("name"))
            a = MANIFEST["assets"][d["image"]]
            self.assertEqual((a["role"], a["variants"]["original"]["path"]), ("deviceImage", f"raumgeraete/{pid}.webp"))

    def test_release_candidate_dev_valid(self):
        cand = ROOT / "release/manifest.json.neu"
        doc = json.loads(cand.read_text(encoding="utf-8"))
        live = json.loads((ROOT / "live/manifest.json").read_text(encoding="utf-8"))
        self.assertEqual({k: v for k, v in doc.items() if k != "mediaCore"}, live, "Altinhalt muss unveraendert bleiben")
        self.assertEqual(codes(doc["mediaCore"]), set())
        # Release bleibt gesperrt, bis die neuen Dateien hochgeladen sind
        self.assertIn("release-staged", codes(doc["mediaCore"], release=True))


class DimensionMismatchTests(unittest.TestCase):
    def test_replaced_legacy_file_marked_broken(self):
        """Am Altpfad ersetzte Datei (andere Maße) wird broken, nie ausgeliefert (Atelier P04, 05.11.2026)."""
        cand = json.loads((ROOT / "release/manifest.json.neu").read_text(encoding="utf-8"))["mediaCore"]
        room = cand["assets"]["room.P04-atelier.r1"]
        self.assertEqual(room["variants"]["original"]["availability"], "broken")
        self.assertEqual(room["variants"]["w1086"]["availability"], "verified")
        self.assertTrue(any("Werkbank" in n for n in room.get("notes", [])))


class SniffTests(unittest.TestCase):
    def test_html_detected(self):
        self.assertEqual(M.sniff(b"<!DOCTYPE html><html>")["kind"], "html")

    def test_png_dims_alpha(self):
        img = next((ROOT / "media/covers").glob("O04-cover-*.png")).read_bytes()[:64]
        r = M.sniff(img)
        self.assertEqual((r["mime"], r["width"], r["height"], r["alpha"]), ("image/png", 1254, 1254, False))

    def test_webp_dims(self):
        f = next((ROOT / "media/optimized/cards").glob("O01-210x360-*.webp"))
        r = M.sniff(f.read_bytes()[:64])
        self.assertEqual((r["mime"], r["width"], r["height"]), ("image/webp", 210, 360))

    def test_norm_paths(self):
        for p in ("/media/audio/O01.mp3", "../media/audio/O01.mp3", "https://flowisaurus.de/wunderhaus/media/audio/O01.mp3"):
            self.assertEqual(M.norm_media_path(p), "audio/O01.mp3")


if __name__ == "__main__":
    unittest.main()
