export type Shloka = {
  id: number;
  shloka: string;
  chapter: number;
  verse: number;
  source: string;
  explanation: string;
};

export const shlokas: Shloka[] = [
  {
    id: 1,
    shloka: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    chapter: 2,
    verse: 47,
    source: 'Bhagavad Gita',
    explanation:
      'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.',
  },
  {
    id: 2,
    shloka: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
    chapter: 2,
    verse: 48,
    source: 'Bhagavad Gita',
    explanation: 'Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.',
  },
  {
    id: 3,
    shloka: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः।\nन हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः॥',
    chapter: 0,
    verse: 0,
    source: 'Hitopadesha',
    explanation: 'Tasks are accomplished by effort, not by just wishing. Deer do not just walk into the mouth of a sleeping lion.',
  },
];
