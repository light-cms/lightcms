import en from "../../../messages/en.json";
import { baseLocale, getLocale, type Locale } from "./index";

export type MessageKey = keyof typeof en;

const translations: Record<string, Record<string, string>> = {
  en,
};

const modules = import.meta.glob<Record<string, string>>("../../../messages/*.json", {
  eager: true,
  import: "default",
});

for (const [path, content] of Object.entries(modules)) {
  const match = /\/messages\/([a-zA-Z0-9-]+)\.json$/.exec(path);
  if (match && match[1]) {
    translations[match[1]] = content;
  }
}

export function t(key: MessageKey, options?: { locale?: Locale }): string {
  const locale = options?.locale ?? getLocale();
  return translations[locale]?.[key] ?? translations[baseLocale]?.[key] ?? en[key] ?? key;
}

export type MessageFunction = (options?: { locale?: Locale }) => string;

export const m: Record<MessageKey, MessageFunction> = new Proxy(
  {} as Record<MessageKey, MessageFunction>,
  {
    get: (_, prop: string) => {
      return (options?: { locale?: Locale }) => t(prop as MessageKey, options);
    },
  },
);

export default m;

// Navigation & Layout
export const skip_to_content = (options?: { locale?: Locale }) => t("skip_to_content", options);
export const nav_home_label = (options?: { locale?: Locale }) => t("nav_home_label", options);
export const nav_primary_label = (options?: { locale?: Locale }) => t("nav_primary_label", options);
export const nav_cms = (options?: { locale?: Locale }) => t("nav_cms", options);
export const nav_cms_label = (options?: { locale?: Locale }) => t("nav_cms_label", options);
export const nav_docs = (options?: { locale?: Locale }) => t("nav_docs", options);
export const nav_docs_label = (options?: { locale?: Locale }) => t("nav_docs_label", options);
export const nav_about = (options?: { locale?: Locale }) => t("nav_about", options);
export const nav_about_label = (options?: { locale?: Locale }) => t("nav_about_label", options);
export const footer_contact = (options?: { locale?: Locale }) => t("footer_contact", options);

// Docs common
export const docs_menu = (options?: { locale?: Locale }) => t("docs_menu", options);
export const docs_open_navigation_label = (options?: { locale?: Locale }) =>
  t("docs_open_navigation_label", options);
export const docs_title = (options?: { locale?: Locale }) => t("docs_title", options);
export const docs_search_placeholder = (options?: { locale?: Locale }) =>
  t("docs_search_placeholder", options);
export const docs_search_label = (options?: { locale?: Locale }) => t("docs_search_label", options);

// Hero & Home
export const hero_badge = (options?: { locale?: Locale }) => t("hero_badge", options);
export const hero_title = (options?: { locale?: Locale }) => t("hero_title", options);
export const hero_description = (options?: { locale?: Locale }) => t("hero_description", options);
export const hero_cta_workspace = (options?: { locale?: Locale }) =>
  t("hero_cta_workspace", options);
export const hero_cta_demo = (options?: { locale?: Locale }) => t("hero_cta_demo", options);
export const hero_preview_label = (options?: { locale?: Locale }) =>
  t("hero_preview_label", options);
export const hero_synced = (options?: { locale?: Locale }) => t("hero_synced", options);

// Features
export const features_headline = (options?: { locale?: Locale }) => t("features_headline", options);
export const feature_content_creation_tag = (options?: { locale?: Locale }) =>
  t("feature_content_creation_tag", options);
export const feature_content_creation_title = (options?: { locale?: Locale }) =>
  t("feature_content_creation_title", options);
export const feature_content_creation_desc = (options?: { locale?: Locale }) =>
  t("feature_content_creation_desc", options);
export const feature_git_tag = (options?: { locale?: Locale }) => t("feature_git_tag", options);
export const feature_git_title = (options?: { locale?: Locale }) => t("feature_git_title", options);
export const feature_git_desc = (options?: { locale?: Locale }) => t("feature_git_desc", options);
export const feature_eco_title = (options?: { locale?: Locale }) => t("feature_eco_title", options);
export const feature_eco_desc = (options?: { locale?: Locale }) => t("feature_eco_desc", options);
export const feature_eco_cta = (options?: { locale?: Locale }) => t("feature_eco_cta", options);
export const feature_templates_tag = (options?: { locale?: Locale }) =>
  t("feature_templates_tag", options);
export const feature_templates_title = (options?: { locale?: Locale }) =>
  t("feature_templates_title", options);
export const feature_templates_desc = (options?: { locale?: Locale }) =>
  t("feature_templates_desc", options);
export const feature_templates_learn_more = (options?: { locale?: Locale }) =>
  t("feature_templates_learn_more", options);
export const feature_templates_ask_question = (options?: { locale?: Locale }) =>
  t("feature_templates_ask_question", options);
export const feature_copilot_title = (options?: { locale?: Locale }) =>
  t("feature_copilot_title", options);
export const feature_copilot_desc = (options?: { locale?: Locale }) =>
  t("feature_copilot_desc", options);

// About
export const about_eyebrow = (options?: { locale?: Locale }) => t("about_eyebrow", options);
export const about_title = (options?: { locale?: Locale }) => t("about_title", options);
export const about_subtitle = (options?: { locale?: Locale }) => t("about_subtitle", options);
export const about_p1 = (options?: { locale?: Locale }) => t("about_p1", options);
export const about_why_title = (options?: { locale?: Locale }) => t("about_why_title", options);
export const about_why_p1 = (options?: { locale?: Locale }) => t("about_why_p1", options);
export const about_why_p2 = (options?: { locale?: Locale }) => t("about_why_p2", options);
export const about_ssg_title = (options?: { locale?: Locale }) => t("about_ssg_title", options);
export const about_ssg_p1 = (options?: { locale?: Locale }) => t("about_ssg_p1", options);
export const about_jamstack_title = (options?: { locale?: Locale }) =>
  t("about_jamstack_title", options);
export const about_jamstack_p1 = (options?: { locale?: Locale }) => t("about_jamstack_p1", options);
export const about_jamstack_link = (options?: { locale?: Locale }) =>
  t("about_jamstack_link", options);
export const about_version_title = (options?: { locale?: Locale }) =>
  t("about_version_title", options);
export const about_version_p1 = (options?: { locale?: Locale }) => t("about_version_p1", options);
export const about_opensource_title = (options?: { locale?: Locale }) =>
  t("about_opensource_title", options);
export const about_opensource_p1 = (options?: { locale?: Locale }) =>
  t("about_opensource_p1", options);
export const about_opensource_guide_link = (options?: { locale?: Locale }) =>
  t("about_opensource_guide_link", options);
export const about_opensource_p2 = (options?: { locale?: Locale }) =>
  t("about_opensource_p2", options);
export const about_touch_title = (options?: { locale?: Locale }) => t("about_touch_title", options);
export const about_action_github = (options?: { locale?: Locale }) =>
  t("about_action_github", options);
export const about_action_sponsor = (options?: { locale?: Locale }) =>
  t("about_action_sponsor", options);
export const about_action_contact = (options?: { locale?: Locale }) =>
  t("about_action_contact", options);
export const about_action_email = (options?: { locale?: Locale }) =>
  t("about_action_email", options);
export const about_action_privacy = (options?: { locale?: Locale }) =>
  t("about_action_privacy", options);

// Errors
export const error_404_title = (options?: { locale?: Locale }) => t("error_404_title", options);
export const error_403_title = (options?: { locale?: Locale }) => t("error_403_title", options);
export const error_401_title = (options?: { locale?: Locale }) => t("error_401_title", options);
export const error_generic_title = (options?: { locale?: Locale }) =>
  t("error_generic_title", options);
export const error_404_message = (options?: { locale?: Locale }) => t("error_404_message", options);
export const error_generic_message = (options?: { locale?: Locale }) =>
  t("error_generic_message", options);
export const error_sign_in = (options?: { locale?: Locale }) => t("error_sign_in", options);
export const error_go_workspace = (options?: { locale?: Locale }) =>
  t("error_go_workspace", options);
export const error_home = (options?: { locale?: Locale }) => t("error_home", options);

// Auth
export const auth_title = (options?: { locale?: Locale }) => t("auth_title", options);
export const auth_sign_in_title = (options?: { locale?: Locale }) =>
  t("auth_sign_in_title", options);
export const auth_account_title = (options?: { locale?: Locale }) =>
  t("auth_account_title", options);
export const auth_account_desc = (options?: { locale?: Locale }) => t("auth_account_desc", options);
export const auth_sign_in_desc = (options?: { locale?: Locale }) => t("auth_sign_in_desc", options);
export const auth_signed_in_as = (options?: { locale?: Locale }) => t("auth_signed_in_as", options);
export const auth_go_to_cms = (options?: { locale?: Locale }) => t("auth_go_to_cms", options);
export const auth_add_passkey = (options?: { locale?: Locale }) => t("auth_add_passkey", options);
export const auth_adding_passkey = (options?: { locale?: Locale }) =>
  t("auth_adding_passkey", options);
export const auth_sign_out = (options?: { locale?: Locale }) => t("auth_sign_out", options);
export const auth_continue_github = (options?: { locale?: Locale }) =>
  t("auth_continue_github", options);
export const auth_redirecting_github = (options?: { locale?: Locale }) =>
  t("auth_redirecting_github", options);
export const auth_use_passkey = (options?: { locale?: Locale }) => t("auth_use_passkey", options);
export const auth_authenticating_passkey = (options?: { locale?: Locale }) =>
  t("auth_authenticating_passkey", options);
export const auth_magic_link_separator = (options?: { locale?: Locale }) =>
  t("auth_magic_link_separator", options);
export const auth_email_label = (options?: { locale?: Locale }) => t("auth_email_label", options);
export const auth_email_submit = (options?: { locale?: Locale }) => t("auth_email_submit", options);
export const auth_email_submitting = (options?: { locale?: Locale }) =>
  t("auth_email_submitting", options);

// Signout
export const signout_title = (options?: { locale?: Locale }) => t("signout_title", options);
export const signout_redirecting = (options?: { locale?: Locale }) =>
  t("signout_redirecting", options);
export const signout_continue = (options?: { locale?: Locale }) => t("signout_continue", options);

// Docs detail
export const docs_read_guide = (options?: { locale?: Locale }) => t("docs_read_guide", options);
export const docs_guide_singular = (options?: { locale?: Locale }) =>
  t("docs_guide_singular", options);
export const docs_guide_plural = (options?: { locale?: Locale }) => t("docs_guide_plural", options);
export const docs_previous = (options?: { locale?: Locale }) => t("docs_previous", options);
export const docs_next = (options?: { locale?: Locale }) => t("docs_next", options);
export const docs_copy_code = (options?: { locale?: Locale }) => t("docs_copy_code", options);
export const docs_copied = (options?: { locale?: Locale }) => t("docs_copied", options);

// Docs components
export const docs_llm_actions = (options?: { locale?: Locale }) => t("docs_llm_actions", options);
export const docs_copy_llm = (options?: { locale?: Locale }) => t("docs_copy_llm", options);
export const docs_copy_link = (options?: { locale?: Locale }) => t("docs_copy_link", options);
export const docs_toast_copied_llm = (options?: { locale?: Locale }) =>
  t("docs_toast_copied_llm", options);
export const docs_toast_copied_link = (options?: { locale?: Locale }) =>
  t("docs_toast_copied_link", options);
export const docs_toast_copy_failed = (options?: { locale?: Locale }) =>
  t("docs_toast_copy_failed", options);
export const docs_toast_copy_link_failed = (options?: { locale?: Locale }) =>
  t("docs_toast_copy_link_failed", options);
export const docs_search_modal_title = (options?: { locale?: Locale }) =>
  t("docs_search_modal_title", options);
export const docs_search_modal_description = (options?: { locale?: Locale }) =>
  t("docs_search_modal_description", options);
export const docs_search_modal_placeholder = (options?: { locale?: Locale }) =>
  t("docs_search_modal_placeholder", options);
export const docs_search_modal_empty = (options?: { locale?: Locale }) =>
  t("docs_search_modal_empty", options);
export const docs_toc_title = (options?: { locale?: Locale }) => t("docs_toc_title", options);
export const docs_edit_github = (options?: { locale?: Locale }) => t("docs_edit_github", options);
export const docs_back_to_top = (options?: { locale?: Locale }) => t("docs_back_to_top", options);
export const blog_banner_title = (options?: { locale?: Locale }) => t("blog_banner_title", options);
export const blog_banner_desc = (options?: { locale?: Locale }) => t("blog_banner_desc", options);
export const blog_banner_cta = (options?: { locale?: Locale }) => t("blog_banner_cta", options);

// Custom widgets & dialogs
export const star_dialog_title = (options?: { locale?: Locale }) => t("star_dialog_title", options);
export const star_dialog_desc = (options?: { locale?: Locale }) => t("star_dialog_desc", options);
export const star_dialog_star = (options?: { locale?: Locale }) => t("star_dialog_star", options);
export const star_dialog_follow = (options?: { locale?: Locale }) =>
  t("star_dialog_follow", options);
export const star_dialog_later = (options?: { locale?: Locale }) => t("star_dialog_later", options);

export const branch_dialog_title = (options?: { locale?: Locale }) =>
  t("branch_dialog_title", options);
export const branch_dialog_name_label = (options?: { locale?: Locale }) =>
  t("branch_dialog_name_label", options);
export const branch_dialog_from_label = (options?: { locale?: Locale }) =>
  t("branch_dialog_from_label", options);
export const branch_dialog_submit = (options?: { locale?: Locale }) =>
  t("branch_dialog_submit", options);
export const branch_dialog_submitting = (options?: { locale?: Locale }) =>
  t("branch_dialog_submitting", options);
export const folder_dialog_title = (options?: { locale?: Locale }) =>
  t("folder_dialog_title", options);
export const folder_dialog_name_label = (options?: { locale?: Locale }) =>
  t("folder_dialog_name_label", options);
export const folder_dialog_submit = (options?: { locale?: Locale }) =>
  t("folder_dialog_submit", options);
export const action_cancel = (options?: { locale?: Locale }) => t("action_cancel", options);

export const mode_label = (options?: { locale?: Locale }) => t("mode_label", options);
export const theme_label = (options?: { locale?: Locale }) => t("theme_label", options);
export const mode_light = (options?: { locale?: Locale }) => t("mode_light", options);
export const mode_dark = (options?: { locale?: Locale }) => t("mode_dark", options);
export const mode_system = (options?: { locale?: Locale }) => t("mode_system", options);

export const language_label = (options?: { locale?: Locale }) => t("language_label", options);
export const language_switcher_label = (options?: { locale?: Locale }) =>
  t("language_switcher_label", options);
export const language_current_label = (options?: { locale?: Locale }) =>
  t("language_current_label", options);

export const status_saving = (options?: { locale?: Locale }) => t("status_saving", options);
export const status_unsaved = (options?: { locale?: Locale }) => t("status_unsaved", options);
export const status_saved = (options?: { locale?: Locale }) => t("status_saved", options);
