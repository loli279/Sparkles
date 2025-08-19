
import React, { useMemo } from 'react';
import { HistoryEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressChartsProps {
  history: HistoryEntry[];
}

const processChartData = (history: HistoryEntry[]) => {
    if (history.length === 0) return [];
    
    const reversedHistory = [...history].reverse();
    
    return reversedHistory.map((entry, index) => {
        const brushAnswer = entry.answers.q1_brush_frequency;
        const flossAnswer = entry.answers.q5_floss_frequency;

        let brushScore = 0;
        if(brushAnswer === 'Once') brushScore = 1;
        if(brushAnswer === 'Twice') brushScore = 2;
        if(brushAnswer === 'More than twice') brushScore = 3;

        let flossScore = 0;
        if(flossAnswer === 'Sometimes') flossScore = 1;
        if(flossAnswer === 'A few times a week') flossScore = 2;
        if(flossAnswer === 'Every day!') flossScore = 3;

        return {
            name: `Week ${index + 1}`,
            brushing: brushScore,
            flossing: flossScore,
        }
    });
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const getHabitLevel = (value: number) => ['None', 'Low', 'Good', 'Great'][value] || 'N/A';
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="label font-bold text-slate-800">{`${label}`}</p>
          <p className="intro" style={{color: 'var(--color-primary)'}}>{`Brushing: ${getHabitLevel(payload[0].value)}`}</p>
          <p className="intro" style={{color: 'var(--color-accent)'}}>{`Flossing: ${getHabitLevel(payload[1].value)}`}</p>
        </div>
      );
    }
  
    return null;
  };

const ProgressCharts: React.FC<ProgressChartsProps> = ({ history }) => {
    const chartData = useMemo(() => processChartData(history), [history]);

    if (history.length < 2) {
        return <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg h-full flex flex-col justify-center items-center">
            <p className="font-semibold text-lg">Complete two surveys to see your progress!</p>
            <p className="text-sm mt-1">Let's track your awesome habits together. 📊</p>
        </div>;
    }

  return (
    <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 20,
                    left: -10,
                    bottom: 5,
                }}
                barGap={8}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis
                    tickFormatter={(value) => ['None', 'Low', 'Good', 'Great'][value]}
                    domain={[0, 3]}
                    ticks={[0, 1, 2, 3]}
                    stroke="#64748b"
                    fontSize={12}
                 />
                <Tooltip
                    cursor={{fill: 'rgba(238, 239, 252, 0.7)'}}
                    content={<CustomTooltip />}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="brushing" fill="var(--color-primary)" name="Brushing Habit" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="flossing" fill="var(--color-accent)" name="Flossing Habit" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ProgressCharts;