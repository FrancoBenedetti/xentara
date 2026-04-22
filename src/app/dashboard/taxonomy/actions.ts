'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Translation types ──────────────────────────────────────────────────────

export interface TagTranslation {
  id: string
  tag_id: string
  language: string
  name: string
  description?: string
}

/** A tag enriched with its cross-language translations (flavors) */
export interface TagWithFlavors {
  id: string
  hub_id: string
  name: string
  description: string
  is_confirmed: boolean
  language: string
  flavors: TagTranslation[]
}

// ── Translation actions ────────────────────────────────────────────────────

/** Fetch all translations for a single tag */
export async function getTagTranslations(tagId: string): Promise<TagTranslation[]> {
  const supabase = await createClient()
  const { data } = await (supabase
    .from('hub_tag_translations' as never) as any)
    .select('*')
    .eq('tag_id', tagId)
    .order('language', { ascending: true })
  return (data as TagTranslation[]) || []
}

/** Fetch translations for all tags in a hub for a given language (name + description overrides) */
export async function getHubTagTranslations(
  hubId: string,
  language: string
): Promise<Record<string, { name: string; description?: string }>> {
  const supabase = await createClient()

  // First get all tag ids for this hub
  const { data: tags } = await (supabase
    .from('hub_tags' as never) as any)
    .select('id')
    .eq('hub_id', hubId)

  const tagIds: string[] = (tags as any[] || []).map((t: any) => t.id)
  if (tagIds.length === 0) return {}

  const { data: translations } = await (supabase
    .from('hub_tag_translations' as never) as any)
    .select('tag_id, name, description')
    .in('tag_id', tagIds)
    .eq('language', language)

  const map: Record<string, { name: string; description?: string }> = {}
  for (const t of (translations as any[] || [])) {
    map[t.tag_id] = { name: t.name, description: t.description }
  }
  return map
}

/** Create or update a translation for a tag in a given language */
export async function upsertTagTranslation(
  tagId: string,
  language: string,
  name: string,
  description: string
): Promise<void> {
  const supabase = await createClient()
  const { error } = await (supabase
    .from('hub_tag_translations' as never) as any)
    .upsert(
      { tag_id: tagId, language, name: name.trim(), description: description.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'tag_id,language' }
    )
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/taxonomy')
}

/** Delete a specific language translation for a tag */
export async function deleteTagTranslation(tagId: string, language: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await (supabase
    .from('hub_tag_translations' as never) as any)
    .delete()
    .eq('tag_id', tagId)
    .eq('language', language)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/taxonomy')
}

export async function fetchTaxonomy(hubId: string) {
  const supabase = await createClient()
  
  const { data: tags, error } = await (supabase
    .from('hub_tags' as never) as any)
    .select('*')
    .eq('hub_id', hubId)
    .order('is_confirmed', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching taxonomy:', error)
    return { confirmed: [], unconfirmed: [] }
  }

  const allTags = (tags as any[]) || []
  return {
    confirmed: allTags.filter((t: any) => t.is_confirmed),
    unconfirmed: allTags.filter((t: any) => !t.is_confirmed),
  }
}

/**
 * Fetch tags for a hub filtered by language.
 * Returns tags whose `language` matches `lang`, each with their translations
 * from other languages ("flavors") eagerly loaded.
 */
export async function getTagsByLanguageWithFlavors(
  hubId: string,
  lang: string
): Promise<{
  confirmed: (TagWithFlavors)[]
  unconfirmed: (TagWithFlavors)[]
}> {
  const supabase = await createClient()

  // 1. Fetch tags in the requested language
  const { data: tags, error } = await (supabase
    .from('hub_tags' as never) as any)
    .select('*')
    .eq('hub_id', hubId)
    .eq('language', lang)
    .order('is_confirmed', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching taxonomy by language:', error)
    return { confirmed: [], unconfirmed: [] }
  }

  const allTags = (tags as any[]) || []
  if (allTags.length === 0) return { confirmed: [], unconfirmed: [] }

  // 2. Bulk-fetch translations for all these tags
  const tagIds = allTags.map((t: any) => t.id)
  const { data: translations } = await (supabase
    .from('hub_tag_translations' as never) as any)
    .select('*')
    .in('tag_id', tagIds)
    .order('language', { ascending: true })

  const translationsByTagId: Record<string, TagTranslation[]> = {}
  for (const tr of (translations as TagTranslation[]) || []) {
    if (!translationsByTagId[tr.tag_id]) translationsByTagId[tr.tag_id] = []
    translationsByTagId[tr.tag_id].push(tr)
  }

  const withFlavors: TagWithFlavors[] = allTags.map((t: any) => ({
    ...t,
    language: t.language || lang,
    flavors: translationsByTagId[t.id] || [],
  }))

  return {
    confirmed: withFlavors.filter(t => t.is_confirmed),
    unconfirmed: withFlavors.filter(t => !t.is_confirmed),
  }
}

export async function confirmTag(tagId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('hub_tags')
    .update({ is_confirmed: true })
    .eq('id', tagId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/taxonomy')
  return { success: true }
}

export async function deleteTag(tagId: string) {
  const supabase = await createClient()
  
  // RLS will handle ownership check
  const { error } = await supabase
    .from('hub_tags')
    .delete()
    .eq('id', tagId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/taxonomy')
  return { success: true }
}

export async function bulkConfirmTags(tagIds: string[]) {
  if (!tagIds.length) return { success: true }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_tags')
    .update({ is_confirmed: true })
    .in('id', tagIds)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/taxonomy')
  return { success: true }
}

export async function bulkDeleteTags(tagIds: string[]) {
  if (!tagIds.length) return { success: true }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_tags')
    .delete()
    .in('id', tagIds)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/taxonomy')
  return { success: true }
}

export async function mergeTags(sourceTagId: string, targetTagId: string) {
  const supabase = await createClient()

  // 0. Fetch both tag descriptions so we can combine them if they differ (R6)
  const { data: bothTags } = await supabase
    .from('hub_tags')
    .select('id, name, description')
    .in('id', [sourceTagId, targetTagId])

  const sourceTag = bothTags?.find(t => t.id === sourceTagId)
  const targetTag = bothTags?.find(t => t.id === targetTagId)

  // 1. Find publications that have both tags to avoid PK violations on update
  const { data: duplicates } = await supabase
    .from('publication_hub_tags')
    .select('publication_id')
    .eq('tag_id', sourceTagId)
    .in('publication_id', 
      (await supabase
        .from('publication_hub_tags')
        .select('publication_id')
        .eq('tag_id', targetTagId)).data?.map(d => d.publication_id) || []
    )

  if (duplicates && duplicates.length > 0) {
    await supabase
      .from('publication_hub_tags')
      .delete()
      .eq('tag_id', sourceTagId)
      .in('publication_id', duplicates.map(d => d.publication_id))
  }

  // 2. Update remaining publications from source to target
  await supabase
    .from('publication_hub_tags')
    .update({ tag_id: targetTagId })
    .eq('tag_id', sourceTagId)

  // 3. Combine descriptions if they differ (R6)
  const srcDesc = sourceTag?.description?.trim() || ''
  const tgtDesc = targetTag?.description?.trim() || ''
  if (srcDesc && tgtDesc && srcDesc !== tgtDesc) {
    const combinedDesc = `${tgtDesc}\n\n[Merged from "${sourceTag?.name}"] ${srcDesc}`
    await supabase
      .from('hub_tags')
      .update({ description: combinedDesc })
      .eq('id', targetTagId)
  }

  // 4. Delete the source tag
  const { error } = await supabase
    .from('hub_tags')
    .delete()
    .eq('id', sourceTagId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/taxonomy')
  return { success: true }
}
