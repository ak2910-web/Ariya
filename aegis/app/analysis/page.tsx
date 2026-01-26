'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAegisStore } from '@/lib/store';
import { useHydrated } from '@/lib/hooks';

export default function Analysis() {
  const hydrated = useHydrated();
  const aiInsights = useAegisStore((state) => state.aiInsights);
  const getTodaysStats = useAegisStore((state) => state.getTodaysStats);
  const generateAIInsights = useAegisStore((state) => state.generateAIInsights);

  const today = new Date().toISOString().split('T')[0];
  const analysis = aiInsights[today];
  const stats = getTodaysStats();

  useEffect(() => {
    // Auto-generate insights on mount if not already generated
    if (hydrated && !analysis && stats.tasksCompleted > 0) {
      generateAIInsights(today);
    }
  }, [hydrated, analysis, stats.tasksCompleted, today, generateAIInsights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'momentum': return '🚀';
      case 'friction': return '⚠️';
      case 'focus': return '🎯';
      case 'completion': return '✅';
      default: return '💡';
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'positive': return 'border-green-500/30 bg-green-900/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-900/10';
      default: return 'border-gray-700 bg-gray-900/30';
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-800 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-light text-gray-100 mb-2">
            Daily Analysis
          </h1>
          <p className="text-gray-400">
            AI-powered insights into your productivity patterns
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <div className="text-sm text-gray-400 mb-2">Tasks Completed</div>
            <div className="text-3xl font-bold text-gray-100">
              {stats.tasksCompleted}
            </div>
            <div className="text-xs text-purple-400 mt-2">
              {stats.tasksAvoided} avoided
            </div>
          </Card>

          <Card>
            <div className="text-sm text-gray-400 mb-2">Focus Time</div>
            <div className="text-3xl font-bold text-gray-100">
              {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
            </div>
            <div className="text-xs text-purple-400 mt-2">
              {stats.sessionsCompleted} sessions
            </div>
          </Card>

          <Card>
            <div className="text-sm text-gray-400 mb-2">Avoided Tasks</div>
            <div className="text-3xl font-bold text-gray-100">
              {stats.tasksAvoided}
            </div>
            <div className="text-xs text-yellow-400 mt-2">
              {stats.tasksAvoided > stats.tasksCompleted ? 'Needs attention' : 'On track'}
            </div>
          </Card>

          <Card highlight>
            <div className="text-sm text-gray-400 mb-2">Productivity Score</div>
            <div className="text-3xl font-bold text-purple-400">
              {stats.tasksCompleted > 0 ? Math.min(95, stats.tasksCompleted * 20 + stats.sessionsCompleted * 5) : 0}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Based on completion
            </div>
          </Card>
        </motion.div>

        {/* AI Narrative Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card highlight>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                <h2 className="text-xl font-medium text-gray-200">
                  AI Analysis
                </h2>
              </div>
              
              {!analysis?.narrativeLoading && (
                <Button
                  onClick={() => generateAIInsights(today)}
                  disabled={stats.tasksCompleted === 0}
                >
                  {analysis?.narrative ? 'Regenerate' : 'Generate Insights'}
                </Button>
              )}
            </div>
            
            {analysis?.narrativeLoading ? (
              <div className="flex items-center gap-3 py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">Analyzing your productivity patterns...</p>
              </div>
            ) : analysis?.narrative ? (
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {analysis.narrative}
                </div>
              </div>
            ) : analysis?.narrativeError ? (
              <div className="text-red-400 p-4 bg-red-900/10 rounded-lg border border-red-500/30">
                {analysis.narrativeError}
              </div>
            ) : stats.tasksCompleted === 0 ? (
              <p className="text-gray-400 py-4">
                Complete at least one task today to unlock AI-powered insights.
              </p>
            ) : (
              <p className="text-gray-400 py-4">
                Click "Generate Insights" to get AI-powered analysis of your day.
              </p>
            )}
          </Card>
        </motion.div>

        {/* Rule-based Quick Insights (fallback) */}
        {analysis?.insights && analysis.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <Card>
              <h3 className="text-lg font-medium text-gray-300 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getInsightColor(insight.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getInsightIcon(insight.type)}</span>
                      <p className="text-sm text-gray-300">{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* General Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h2 className="text-lg font-medium text-gray-300 mb-4">
              General Recommendations
            </h2>
            
            <div className="space-y-3">
              {stats.tasksAvoided > stats.tasksCompleted ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📋</span>
                    <p className="text-sm text-gray-300">
                      Reduce decision fatigue: Pre-commit to your top 3 tasks tonight
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⏰</span>
                    <p className="text-sm text-gray-300">
                      Start with the hardest task first thing in the morning
                    </p>
                  </div>
                </>
              ) : stats.tasksCompleted > 3 ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎯</span>
                    <p className="text-sm text-gray-300">
                      Great momentum! Maintain this pace by keeping your task list lean
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📈</span>
                    <p className="text-sm text-gray-300">
                      Consider increasing task complexity to challenge yourself
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🌅</span>
                    <p className="text-sm text-gray-300">
                      Set clear priorities for tomorrow morning
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚡</span>
                    <p className="text-sm text-gray-300">
                      Plan focus sessions during your peak energy hours
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
