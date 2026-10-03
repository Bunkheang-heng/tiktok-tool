import { ContentGenerationInput, LlmProvider } from './LlmProvider';
import { GeneratedContentData } from '../../core/types/content';

export class MockLlmProvider implements LlmProvider {
  public readonly id = 'mock-llm';
  public readonly name = 'Mock Gemini LLM Provider';

  public async generateContent(input: ContentGenerationInput): Promise<GeneratedContentData> {
    const topic = input.topic || 'What is leverage?';
    const topicKhmer = input.topicKhmer || 'តើ Leverage គឺជាអ្វី?';

    return {
      topic,
      topicKhmer,
      hook: `តើអ្នកដឹងទេថា ${topicKhmer} អាចធ្វើឱ្យអ្នកចំណេញទ្វេដង ឬខាតបង់ទាំងអស់បាន?`,
      scriptKhmer: `សួស្តីបងប្អូនទាំងអស់គ្នាដែលកំពុងសិក្សាអំពីការជួញដូរ Forex និងមាស! ថ្ងៃនេះយើងនឹងស្វែងយល់លម្អិតអំពី ${topicKhmer}។ ចំណុចសំខាន់ដំបូង គឺត្រូវយល់ដឹងពីរបៀបគ្រប់គ្រងហានិភ័យ និងមិនត្រូវប្រើប្រាស់លើសពីសមត្ថភាពដើមទុនឡើយ។ ចងចាំថា ការ Trade ប្រកបដោយវិន័យ គឺជាគន្លឹះឆ្ពោះទៅរកភាពជោគជ័យយូរអង្វែង!`,
      videoPrompt: `High quality financial 3D animation showing ${topic} concepts, vibrant candlestick charts on dark neon aesthetic background, modern trading terminal, 9:16 vertical composition.`,
      titleKhmer: `ស្វែងយល់ពី ${topicKhmer} ត្រឹមតែ ១ នាទី!`,
      descriptionKhmer: `វីដេអូបង្រៀនខ្លីអំពី ${topicKhmer} សម្រាប់អ្នកចាប់ផ្តើមជួញដូរថ្មីៗ។ រៀន Trade ជាមួយ Ben10 FX។`,
      hashtags: [
        '#TradingKhmer',
        '#ForexKhmer',
        '#Ben10FX',
        '#GoldTradingKhmer',
        '#TradingEducation'
      ]
    };
  }
}
