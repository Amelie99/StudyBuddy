'use server';
/**
 * @fileOverview A flow for generating study group suggestions.
 *
 * - suggestGroups - A function that suggests study groups based on user profile.
 * - SuggestGroupsInput - The input type for the suggestGroups function.
 * - SuggestGroupsOutput - The return type for the suggestGroups function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AppUser } from '@/lib/types';

const SuggestGroupsInputSchema = z.object({
    studiengang: z.string().optional().describe('The user\'s course of study.'),
    kurse: z.array(z.string()).optional().describe('A list of courses the user is taking.'),
    lerninteressen: z.array(z.string()).optional().describe('A list of the user\'s learning interests.'),
});
export type SuggestGroupsInput = z.infer<typeof SuggestGroupsInputSchema>;

const GroupSuggestionSchema = z.object({
    name: z.string().describe('A creative and engaging name for the study group.'),
    description: z.string().describe('A brief, one-sentence description of the group\'s purpose or focus.'),
});

const SuggestGroupsOutputSchema = z.object({
    suggestions: z.array(GroupSuggestionSchema).describe('A list of 3 study group suggestions.'),
});
export type SuggestGroupsOutput = z.infer<typeof SuggestGroupsOutputSchema>;


export async function suggestGroups(input: AppUser): Promise<SuggestGroupsOutput> {
    const flowInput: SuggestGroupsInput = {
        studiengang: input.studiengang,
        kurse: input.kurse,
        lerninteressen: input.lerninteressen,
    };
    return suggestGroupsFlow(flowInput);
}

const prompt = ai.definePrompt({
    name: 'suggestGroupsPrompt',
    input: { schema: SuggestGroupsInputSchema },
    output: { schema: SuggestGroupsOutputSchema },
    prompt: `You are an expert in creating engaging and collaborative learning communities at a German university (Hochschule).
    Based on the following student profile, generate 3 unique and creative suggestions for study groups.

    The group names should be catchy and relevant, possibly incorporating German university slang or course-specific terms.
    The descriptions should be concise and appealing.

    Student Profile:
    - Course of Study (Studiengang): {{studiengang}}
    - Current Courses (Kurse): {{#if kurse}}{{#each kurse}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
    - Learning Interests (Lerninteressen): {{#if lerninteressen}}{{#each lerninteressen}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}

    Generate exactly 3 suggestions.
    `,
});

const suggestGroupsFlow = ai.defineFlow(
    {
        name: 'suggestGroupsFlow',
        inputSchema: SuggestGroupsInputSchema,
        outputSchema: SuggestGroupsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
