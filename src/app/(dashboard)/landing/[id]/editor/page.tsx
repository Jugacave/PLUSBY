"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Sparkles, Eye, Globe, GripVertical, Pencil, Trash2, Plus,
  Check, Loader2, ChevronDown, ChevronUp, Copy, X, Upload, Download,
  ChevronRight, RefreshCw, AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

type LandingMode = "page" | "banners";

type SectionType =
  | "hero" | "benefits" | "testimonials" | "urgency" | "cta"
  | "problem" | "solution" | "features" | "pricing";

interface Section {
  id: string;
  type: SectionType;
  headline: string;
  subtext: string;
  ctaText?: string;
  items?: string[];
}

interface BannerConfig {
  description: string;
  benefits: string[];
  problems: string[];
  ingredients: string[];
  differentiator: string;
  colors: string[];
  font: string;
  country: string;
  aiModel: string;
  priceSale: string;
  priceOriginal: string;
  priceBundle2: string;
  priceBundle3: string;
  refImages: (string | null)[];
  angles: string[];
  selectedAngle: string;
  sectionStyles: Record<string, string>; // sectionId → styleId
}

interface BannerStyle {
  id: string;
  name: string;
  desc: string;
  gradient: string;
  accentColor: string;
  textColor: string;
  promptKeywords: string;
}

const DEFAULT_BANNER_CONFIG: BannerConfig = {
  description: "",
  benefits: ["", "", ""],
  problems: ["", ""],
  ingredients: [""],
  differentiator: "",
  colors: ["#FF6B35", "#1C1C26", "#F0F0F5"],
  font: "Poppins",
  country: "CO",
  aiModel: "fal-flux-ultra",
  priceSale: "",
  priceOriginal: "",
  priceBundle2: "",
  priceBundle3: "",
  refImages: [null, null, null],
  angles: [],
  selectedAngle: "",
  sectionStyles: {},
};