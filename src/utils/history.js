export function mapHistoryItem(item) {
  return {
    id: item.queryId,
    content: item.inputText,
    responseText: item.responseText || '',
    timestamp: item.timestamp,
    statusTag: item.source || 'AI',
    answerId: item.answerId || null,
    audioId: item.audioId || null,
    audioDuration: item.audioDuration || null,
  };
}
