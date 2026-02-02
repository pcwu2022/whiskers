'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

// Dashboard password - should match Convex env variable
const DASHBOARD_PASSWORD_HASH = 'whiskers-admin-2026'; // In production, use proper hashing

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

function MetricCard({ title, value, subtitle, trend, trendValue }: MetricCardProps) {
    return (
        <div className="metric-card">
            <h3>{title}</h3>
            <div className="metric-value">{value}</div>
            {subtitle && <p className="metric-subtitle">{subtitle}</p>}
            {trend && trendValue && (
                <span className={`metric-trend ${trend}`}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                </span>
            )}
        </div>
    );
}

interface BarChartProps {
    data: { label: string; value: number; color?: string }[];
    title: string;
    maxValue?: number;
}

function BarChart({ data, title, maxValue }: BarChartProps) {
    const max = maxValue || Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="chart-container">
            <h3>{title}</h3>
            <div className="bar-chart">
                {data.map((item, index) => (
                    <div key={index} className="bar-row">
                        <span className="bar-label">{item.label}</span>
                        <div className="bar-track">
                            <div 
                                className="bar-fill"
                                style={{ 
                                    width: `${(item.value / max) * 100}%`,
                                    backgroundColor: item.color || '#6366f1'
                                }}
                            />
                        </div>
                        <span className="bar-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FunnelChart({ steps, counts }: { steps: string[]; counts: number[] }) {
    const maxCount = Math.max(...counts, 1);
    
    return (
        <div className="funnel-chart">
            {steps.map((step, index) => {
                const count = counts[index] || 0;
                const prevCount = index > 0 ? counts[index - 1] : count;
                const dropOff = prevCount > 0 ? ((prevCount - count) / prevCount * 100).toFixed(1) : '0';
                
                return (
                    <div key={index} className="funnel-step">
                        <div 
                            className="funnel-bar"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                        >
                            <span className="funnel-label">{step}</span>
                            <span className="funnel-count">{count}</span>
                        </div>
                        {index > 0 && (
                            <span className="funnel-dropoff">-{dropOff}%</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function DashboardPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('7d');

    // Calculate date range
    const { startDate, endDate } = useMemo(() => {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;
        
        switch (dateRange) {
            case 'today':
                return { startDate: now - day, endDate: now };
            case '7d':
                return { startDate: now - 7 * day, endDate: now };
            case '30d':
                return { startDate: now - 30 * day, endDate: now };
            default:
                return { startDate: now - 7 * day, endDate: now };
        }
    }, [dateRange]);

    // Fetch data only when authenticated
    const summaryData = useQuery(
        api.dashboard.getSummaryCounts,
        isAuthenticated ? { password, startDate, endDate } : 'skip'
    );

    const landingMetrics = useQuery(
        api.dashboard.getLandingMetrics,
        isAuthenticated ? { password, startDate, endDate } : 'skip'
    );

    const recentEvents = useQuery(
        api.dashboard.getRecentEvents,
        isAuthenticated ? { password, limit: 20 } : 'skip'
    );

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password === DASHBOARD_PASSWORD_HASH) {
            setIsAuthenticated(true);
            setError('');
            // Store in session for convenience (not secure, just UX)
            sessionStorage.setItem('dashboard_auth', 'true');
        } else {
            setError('Invalid password');
        }
    };

    // Check session on mount
    useEffect(() => {
        const auth = sessionStorage.getItem('dashboard_auth');
        if (auth === 'true') {
            // Still need password for queries
            const storedPass = sessionStorage.getItem('dashboard_pass');
            if (storedPass) {
                setPassword(storedPass);
                setIsAuthenticated(true);
            }
        }
    }, []);

    // Store password when authenticated
    useEffect(() => {
        if (isAuthenticated && password) {
            sessionStorage.setItem('dashboard_pass', password);
        }
    }, [isAuthenticated, password]);

    // Login screen
    if (!isAuthenticated) {
        return (
            <div className="dashboard-login">
                <div className="login-container">
                    <h1>🐱 Whiskers Analytics</h1>
                    <p>Enter password to access the dashboard</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Dashboard password"
                            autoFocus
                        />
                        {error && <p className="error">{error}</p>}
                        <button type="submit">Access Dashboard</button>
                    </form>
                </div>

                <style jsx>{`
                    .dashboard-login {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    }

                    .login-container {
                        background: rgba(255, 255, 255, 0.05);
                        padding: 48px;
                        border-radius: 16px;
                        text-align: center;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }

                    h1 {
                        color: #fff;
                        margin-bottom: 8px;
                    }

                    p {
                        color: #a0a0a0;
                        margin-bottom: 24px;
                    }

                    input {
                        width: 100%;
                        padding: 12px 16px;
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        background: rgba(0, 0, 0, 0.3);
                        color: #fff;
                        font-size: 16px;
                        margin-bottom: 16px;
                    }

                    input:focus {
                        outline: none;
                        border-color: #6366f1;
                    }

                    button {
                        width: 100%;
                        padding: 12px 24px;
                        border-radius: 8px;
                        border: none;
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        color: #fff;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: transform 0.2s;
                    }

                    button:hover {
                        transform: translateY(-2px);
                    }

                    .error {
                        color: #ef4444;
                        font-size: 14px;
                        margin-bottom: 16px;
                    }
                `}</style>
            </div>
        );
    }

    // Check for errors
    if (summaryData?.error || landingMetrics?.error) {
        return (
            <div className="dashboard-error">
                <h1>Access Denied</h1>
                <p>Invalid credentials. Please refresh and try again.</p>
            </div>
        );
    }

    // Loading state
    const isLoading = !summaryData || !landingMetrics;

    // Compute derived metrics
    const roleData = landingMetrics?.roleDistribution 
        ? [
            { label: 'Students', value: landingMetrics.roleDistribution.student || 0, color: '#22c55e' },
            { label: 'Parents', value: landingMetrics.roleDistribution.parent || 0, color: '#3b82f6' },
            { label: 'Teachers', value: landingMetrics.roleDistribution.teacher || 0, color: '#f59e0b' },
        ]
        : [];

    const deviceData = landingMetrics?.deviceDistribution
        ? [
            { label: 'Desktop', value: landingMetrics.deviceDistribution.desktop || 0 },
            { label: 'Mobile', value: landingMetrics.deviceDistribution.mobile || 0 },
            { label: 'Tablet', value: landingMetrics.deviceDistribution.tablet || 0 },
        ]
        : [];

    const sourceData = landingMetrics?.sourceDistribution
        ? [
            { label: 'Direct', value: landingMetrics.sourceDistribution.direct || 0 },
            { label: 'Search', value: landingMetrics.sourceDistribution.search || 0 },
            { label: 'Social', value: landingMetrics.sourceDistribution.social || 0 },
            { label: 'Referral', value: landingMetrics.sourceDistribution.referral || 0 },
        ]
        : [];

    const ctaData = landingMetrics?.ctaPerformance
        ? Object.entries(landingMetrics.ctaPerformance).map(([id, data]: [string, any]) => ({
            label: id,
            value: data.clicks || 0,
        }))
        : [];

    // Section engagement
    const sectionData = landingMetrics?.sectionEngagement
        ? Object.entries(landingMetrics.sectionEngagement).map(([id, data]: [string, any]) => ({
            label: id,
            value: data.views || 0,
        }))
        : [];

    // Conversion funnel
    const funnelSteps = ['Landing', 'Role Selected', 'Demo Viewed', 'Playground'];
    const totalVisitors = landingMetrics?.summary?.totalVisitors || 0;
    const roleSelections = Object.values(landingMetrics?.roleDistribution || {}).reduce((a: number, b: any) => a + (b || 0), 0);
    const demoViews = landingMetrics?.sectionEngagement?.demo?.views || 0;
    const conversions = summaryData?.conversions || 0;
    const funnelCounts = [totalVisitors, roleSelections, demoViews, conversions];

    return (
        <div className="dashboard-page">
            <nav className="dashboard-nav">
                <a href="/" className="nav-brand">🐱 Whiskers</a>
                <span className="nav-title">Analytics Dashboard</span>
            </nav>
            
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>🐱 Whiskers Analytics</h1>
                    <div className="date-range-selector">
                        <button 
                            className={dateRange === 'today' ? 'active' : ''}
                            onClick={() => setDateRange('today')}
                        >
                            Today
                        </button>
                        <button 
                            className={dateRange === '7d' ? 'active' : ''}
                            onClick={() => setDateRange('7d')}
                        >
                            7 Days
                        </button>
                        <button 
                            className={dateRange === '30d' ? 'active' : ''}
                            onClick={() => setDateRange('30d')}
                        >
                            30 Days
                        </button>
                    </div>
                </header>

                {isLoading ? (
                    <div className="loading">Loading metrics...</div>
                ) : (
                    <>
                        {/* Key Metrics */}
                        <section className="metrics-grid">
                            <MetricCard 
                                title="Total Visitors"
                                value={totalVisitors}
                                subtitle="Unique landing page views"
                            />
                            <MetricCard 
                                title="Role Selection Rate"
                                value={`${((landingMetrics?.summary?.roleSelectionRate || 0) * 100).toFixed(1)}%`}
                                subtitle="Visitors who selected a role"
                            />
                            <MetricCard 
                                title="Conversion Rate"
                                value={`${((landingMetrics?.summary?.overallConversionRate || 0) * 100).toFixed(1)}%`}
                                subtitle="Reached playground"
                            />
                            <MetricCard 
                                title="Bounce Rate"
                                value={`${((landingMetrics?.summary?.bounceRate || 0) * 100).toFixed(1)}%`}
                                subtitle="Left without converting"
                            />
                            <MetricCard 
                                title="Avg Time to Role"
                                value={`${((landingMetrics?.summary?.avgTimeToRoleSelectionMs || 0) / 1000).toFixed(1)}s`}
                                subtitle="Time to select a role"
                            />
                            <MetricCard 
                                title="Total Events"
                                value={summaryData?.totalEvents || 0}
                                subtitle="Tracked interactions"
                            />
                        </section>

                        {/* Conversion Funnel */}
                        <section className="chart-section">
                            <h2>Conversion Funnel</h2>
                            <FunnelChart steps={funnelSteps} counts={funnelCounts} />
                        </section>

                        {/* Charts Row */}
                        <section className="charts-row">
                            <BarChart 
                                data={roleData} 
                                title="Role Distribution"
                            />
                            <BarChart 
                                data={deviceData} 
                                title="Device Types"
                            />
                            <BarChart 
                                data={sourceData} 
                                title="Traffic Sources"
                            />
                        </section>

                        {/* Engagement Charts */}
                        <section className="charts-row">
                            <BarChart 
                                data={sectionData} 
                                title="Section Views"
                            />
                            <BarChart 
                                data={ctaData} 
                                title="CTA Clicks"
                            />
                        </section>

                        {/* Conversion by Role */}
                        {landingMetrics?.conversionByRole && (
                            <section className="chart-section">
                                <h2>Conversion by Role</h2>
                                <div className="conversion-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Role</th>
                                                <th>Selected</th>
                                                <th>Converted</th>
                                                <th>Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(landingMetrics.conversionByRole).map(([role, data]: [string, any]) => (
                                                <tr key={role}>
                                                    <td className="role-cell">{role}</td>
                                                    <td>{data.selected}</td>
                                                    <td>{data.converted}</td>
                                                    <td className="rate-cell">
                                                        {data.selected > 0 
                                                            ? `${((data.converted / data.selected) * 100).toFixed(1)}%`
                                                            : '0%'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* Recent Events */}
                        <section className="chart-section">
                            <h2>Recent Events</h2>
                            <div className="events-list">
                                {recentEvents?.events?.slice(0, 10).map((event: any, index: number) => (
                                    <div key={index} className="event-item">
                                        <span className="event-type">{event.eventType}</span>
                                        <span className="event-time">
                                            {new Date(event.timestamp).toLocaleTimeString()}
                                        </span>
                                        <span className="event-session">
                                            {event.sessionId.slice(0, 8)}...
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>

            <style jsx>{`
                .dashboard-page {
                    min-height: 100vh;
                    background: #0f0f1a;
                    color: #fff;
                }

                .dashboard-nav {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 24px;
                    background: rgba(0, 0, 0, 0.3);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .nav-brand {
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                    text-decoration: none;
                }

                .nav-title {
                    color: #a0a0a0;
                    font-size: 14px;
                }

                .dashboard-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 24px;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .dashboard-header h1 {
                    font-size: 28px;
                    font-weight: 600;
                }

                .date-range-selector {
                    display: flex;
                    gap: 8px;
                }

                .date-range-selector button {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: transparent;
                    color: #a0a0a0;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .date-range-selector button.active,
                .date-range-selector button:hover {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: #6366f1;
                    color: #fff;
                }

                .loading {
                    text-align: center;
                    padding: 48px;
                    color: #a0a0a0;
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .metric-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .metric-card h3 {
                    font-size: 12px;
                    color: #a0a0a0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }

                .metric-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #fff;
                }

                .metric-subtitle {
                    font-size: 12px;
                    color: #666;
                    margin-top: 4px;
                }

                .metric-trend {
                    font-size: 12px;
                    margin-top: 8px;
                    display: inline-block;
                }

                .metric-trend.up { color: #22c55e; }
                .metric-trend.down { color: #ef4444; }
                .metric-trend.neutral { color: #a0a0a0; }

                .chart-section {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .chart-section h2 {
                    font-size: 18px;
                    margin-bottom: 20px;
                }

                .charts-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .chart-container {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .chart-container h3 {
                    font-size: 14px;
                    margin-bottom: 16px;
                    color: #a0a0a0;
                }

                .bar-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .bar-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bar-label {
                    width: 80px;
                    font-size: 13px;
                    color: #a0a0a0;
                }

                .bar-track {
                    flex: 1;
                    height: 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .bar-value {
                    width: 40px;
                    text-align: right;
                    font-size: 13px;
                    font-weight: 500;
                }

                .funnel-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .funnel-step {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .funnel-bar {
                    height: 40px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    min-width: 120px;
                    transition: width 0.3s ease;
                }

                .funnel-label {
                    font-size: 13px;
                    font-weight: 500;
                }

                .funnel-count {
                    font-size: 14px;
                    font-weight: 600;
                }

                .funnel-dropoff {
                    font-size: 12px;
                    color: #ef4444;
                    min-width: 50px;
                }

                .conversion-table {
                    overflow-x: auto;
                }

                .conversion-table table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .conversion-table th,
                .conversion-table td {
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .conversion-table th {
                    color: #a0a0a0;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .role-cell {
                    text-transform: capitalize;
                    font-weight: 500;
                }

                .rate-cell {
                    color: #22c55e;
                    font-weight: 600;
                }

                .events-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .event-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                }

                .event-type {
                    background: rgba(99, 102, 241, 0.2);
                    color: #a5b4fc;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: monospace;
                }

                .event-time {
                    color: #a0a0a0;
                    font-size: 12px;
                }

                .event-session {
                    color: #666;
                    font-size: 11px;
                    font-family: monospace;
                }

                .dashboard-error {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #0f0f1a;
                    color: #fff;
                }

                @media (max-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .charts-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
