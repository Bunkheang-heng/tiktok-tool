import { TopicCategory } from '../../core/types/topic';

export interface DefaultTopicSeed {
  title: string;
  khmerTitle: string;
  category: TopicCategory;
  cooldownDays: number;
}

export const DEFAULT_TOPICS: DefaultTopicSeed[] = [
  // Beginner
  {
    title: 'What is trading?',
    khmerTitle: 'តើការ Trade គឺជាអ្វី? ការណែនាំមូលដ្ឋានសម្រាប់អ្នកចាប់ផ្តើម',
    category: 'Beginner',
    cooldownDays: 14
  },
  {
    title: 'What is forex?',
    khmerTitle: 'តើ Forex គឺជាអ្វី? របៀបដំណើរការនៃទីផ្សាររូបិយប័ណ្ណអន្តរជាតិ',
    category: 'Beginner',
    cooldownDays: 14
  },
  {
    title: 'What is gold trading?',
    khmerTitle: 'តើការជួញដូរមាស (XAUUSD) គឺជាអ្វី? ហេតុអ្វីបានជាគេនិយម Trade មាស?',
    category: 'Beginner',
    cooldownDays: 14
  },
  {
    title: 'What is a broker?',
    khmerTitle: 'តើ Broker គឺជាអ្វី? របៀបជ្រើសរើស Broker ដែលមានសុវត្ថិភាព',
    category: 'Beginner',
    cooldownDays: 14
  },
  {
    title: 'Buy vs Sell',
    khmerTitle: 'ការ Buy និង Sell ក្នុងទីផ្សារ Forex និងមាស ដំណើរការយ៉ាងដូចម្តេច?',
    category: 'Beginner',
    cooldownDays: 10
  },
  {
    title: 'What is leverage?',
    khmerTitle: 'តើ Leverage គឺជាអ្វី? ដាវមុខពីរក្នុងការ Trade',
    category: 'Beginner',
    cooldownDays: 10
  },
  {
    title: 'What is lot size?',
    khmerTitle: 'តើ Lot size គឺជាអ្វី? របៀបគណនា Lot អោយត្រូវតាមដើមទុន',
    category: 'Beginner',
    cooldownDays: 10
  },
  {
    title: 'What is spread?',
    khmerTitle: 'តើ Spread គឺជាអ្វី? ហេតុអ្វីបានជាចេញ Order ដំបូងឃើញដកលុយ?',
    category: 'Beginner',
    cooldownDays: 10
  },
  {
    title: 'What is stop loss?',
    khmerTitle: 'តើ Stop Loss គឺជាអ្វី? ខ្សែក្រវ៉ាត់សុវត្ថិភាពសម្រាប់ដើមទុនរបស់អ្នក',
    category: 'Beginner',
    cooldownDays: 10
  },
  {
    title: 'What is take profit?',
    khmerTitle: 'តើ Take Profit គឺជាអ្វី? របៀបកំណត់គោលដៅប្រាក់ចំណេញច្បាស់លាស់',
    category: 'Beginner',
    cooldownDays: 10
  },

  // Technical Analysis
  {
    title: 'Support and resistance',
    khmerTitle: 'របៀបកំណត់តំបន់ Support និង Resistance យ៉ាងត្រឹមត្រូវ',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Trend identification',
    khmerTitle: 'របៀបមើល Trend ទីផ្សារ Uptrend, Downtrend និង Sideway',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Market structure',
    khmerTitle: 'ការយល់ដឹងអំពី Market Structure: Highs និង Lows',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Break of Structure (BOS)',
    khmerTitle: 'តើ BOS (Break of Structure) បញ្ជាក់អ្វីខ្លះពីកម្លាំងទីផ្សារ?',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Change of Character (CHOCH)',
    khmerTitle: 'តើ CHOCH ជាសញ្ញាត្រៀមប្តូរទិសដៅទីផ្សារយ៉ាងដូចម្តេច?',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Liquidity concept',
    khmerTitle: 'តើ Liquidity គឺជាអ្វី? ហេតុអ្វីទីផ្សារតែងតែ Sweep Stop Loss?',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Order blocks',
    khmerTitle: 'ការស្វែងរក Order Block ដែលមានឱកាសជោគជ័យខ្ពស់',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Fair value gaps (FVG)',
    khmerTitle: 'តើ FVG (Fair Value Gap) គឺជាអ្វី ហើយប្រើប្រាស់យ៉ាងដូចម្តេច?',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Moving averages',
    khmerTitle: 'ការប្រើប្រាស់ Moving Average ដើម្បីចាប់ទិសដៅទីផ្សារធំ',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'RSI Indicator',
    khmerTitle: 'របៀបប្រើប្រាស់សន្ទស្សន៍ RSI និង Divergence',
    category: 'Technical Analysis',
    cooldownDays: 12
  },
  {
    title: 'Bollinger Bands',
    khmerTitle: 'ការវាស់កម្រិតប្រែប្រួលតម្លៃទីផ្សារជាមួយ Bollinger Bands',
    category: 'Technical Analysis',
    cooldownDays: 12
  },

  // Risk Management
  {
    title: 'Position sizing',
    khmerTitle: 'របៀបគណនា Position Size មិនឱ្យ Burn គណនី',
    category: 'Risk Management',
    cooldownDays: 10
  },
  {
    title: 'Risk per trade',
    khmerTitle: 'ច្បាប់ហានិភ័យ ១% ទៅ ២% ក្នុងមួយ Trade ជួយសង្គ្រោះអ្នកយ៉ាងណា?',
    category: 'Risk Management',
    cooldownDays: 10
  },
  {
    title: 'Overleveraging danger',
    khmerTitle: 'គ្រោះថ្នាក់ធំនៃការប្រើប្រាស់ Overleveraging ក្នុងការ Trade',
    category: 'Risk Management',
    cooldownDays: 10
  },
  {
    title: 'Revenge trading',
    khmerTitle: 'Revenge Trading គឺជាមេរៀនថ្លៃបំផុត - របៀបបញ្ឈប់វា',
    category: 'Risk Management',
    cooldownDays: 10
  },
  {
    title: 'Drawdown management',
    khmerTitle: 'របៀបគ្រប់គ្រង Drawdown និងស្តារគណនីមកវិញដោយសុវត្ថិភាព',
    category: 'Risk Management',
    cooldownDays: 10
  },
  {
    title: 'Risk-to-reward ratio',
    khmerTitle: 'ហេតុអ្វី Risk-to-Reward 1:2 ឬ 1:3 ធ្វើឱ្យអ្នកចំណេញទោះ Winrate ទាប?',
    category: 'Risk Management',
    cooldownDays: 10
  },
  {
    title: 'Daily loss limits',
    khmerTitle: 'ការកំណត់ Max Loss ប្រចាំថ្ងៃ ដើម្បីការពារផ្លូវចិត្ត និងលុយដើម',
    category: 'Risk Management',
    cooldownDays: 10
  },
  {
    title: 'Why stop losses matter',
    khmerTitle: 'ហេតុអ្វីបានជា Trader អាជីពមិនដែលដោះ Stop Loss ចោល?',
    category: 'Risk Management',
    cooldownDays: 10
  },

  // Psychology
  {
    title: 'Overcoming FOMO',
    khmerTitle: 'វិធីសាស្ត្រយកឈ្នះ FOMO កុំឱ្យដេញចាប់តម្លៃខុសកាលៈទេសៈ',
    category: 'Psychology',
    cooldownDays: 10
  },
  {
    title: 'Managing trading fear',
    khmerTitle: 'របៀបគ្រប់គ្រងការភ័យខ្លាចពេលចូល Order និងពេលកាត់ខាត',
    category: 'Psychology',
    cooldownDays: 10
  },
  {
    title: 'Controlling greed',
    khmerTitle: 'កុំឱ្យភាពលោភលន់បំផ្លាញប្រាក់ចំណេញដែលអ្នកខំរកបាន',
    category: 'Psychology',
    cooldownDays: 10
  },
  {
    title: 'Trader discipline',
    khmerTitle: 'វិន័យដែកក្នុងការ Trade - ភាពខុសគ្នារវាងអ្នកលេងល្បែង និង Trader',
    category: 'Psychology',
    cooldownDays: 10
  },
  {
    title: 'Patience in trading',
    khmerTitle: 'ភាពអត់ធ្មត់រង់ចាំ Setup ល្អបំផុត គឺ ៩០% នៃភាពជោគជ័យ',
    category: 'Psychology',
    cooldownDays: 10
  },
  {
    title: 'Overtrading consequences',
    khmerTitle: 'ផលវិបាកនៃការ Trade ច្រើនហួសហេតុ (Overtrading)',
    category: 'Psychology',
    cooldownDays: 10
  },
  {
    title: 'Creating a trading plan',
    khmerTitle: 'របៀបបង្កើត Trading Plan ច្បាស់លាស់មុនពេលបើក Chart',
    category: 'Psychology',
    cooldownDays: 10
  },
  {
    title: 'Importance of journaling',
    khmerTitle: 'ហេតុអ្វីអ្នកត្រូវតែកត់ត្រា Trading Journal រាល់ថ្ងៃ?',
    category: 'Psychology',
    cooldownDays: 10
  },

  // Macro
  {
    title: 'Understanding inflation',
    khmerTitle: 'អតិផរណា (Inflation) ប៉ះពាល់ដល់តម្លៃរូបិយប័ណ្ណ និងមាសយ៉ាងដូចម្តេច?',
    category: 'Macro',
    cooldownDays: 14
  },
  {
    title: 'Consumer Price Index (CPI)',
    khmerTitle: 'របាយការណ៍ CPI ចេញមក របៀបដែលទីផ្សារមាសប្រតិកម្មភ្លាមៗ',
    category: 'Macro',
    cooldownDays: 14
  },
  {
    title: 'Non-Farm Payrolls (NFP)',
    khmerTitle: 'NFP ថ្ងៃសុក្រដើមខែ៖ ហេតុអ្វីបានជាទីផ្សារប្រែប្រួលខ្លាំង?',
    category: 'Macro',
    cooldownDays: 14
  },
  {
    title: 'Interest rate decisions',
    khmerTitle: 'អត្រាការប្រាក់ឡើង ឬចុះ ជះឥទ្ធិពលអ្វីខ្លះដល់ Trader?',
    category: 'Macro',
    cooldownDays: 14
  },
  {
    title: 'The Federal Reserve',
    khmerTitle: 'ស្គាល់ Federal Reserve (Fed) និងសារសំខាន់នៃកិច្ចប្រជុំ FOMC',
    category: 'Macro',
    cooldownDays: 14
  },
  {
    title: 'USD strength and pairs',
    khmerTitle: 'ទំនាក់ទំនងរវាងកម្លាំងលុយដុល្លារ DXY និងគូជួញដូរដទៃទៀត',
    category: 'Macro',
    cooldownDays: 14
  },
  {
    title: 'Gold and bond yields',
    khmerTitle: 'ហេតុអ្វី Bond Yields ឡើងថ្លៃ ធ្វើឱ្យតម្លៃមាសធ្លាក់ចុះ?',
    category: 'Macro',
    cooldownDays: 14
  },
  {
    title: 'Using the economic calendar',
    khmerTitle: 'របៀបពិនិត្យព័ត៌មានក្រហមលើ Economic Calendar មុនពេល Trade',
    category: 'Macro',
    cooldownDays: 14
  }
];
