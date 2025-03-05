import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Brain, Heart, Smile, Target, Activity } from "lucide-react";

const NeuroNavDashboard = () => {
  const [activeTab, setActiveTab] = useState("Last 24 Hours");
  const [sentimentData, setSentimentData] = useState({
    sentiment: 0,
    anxiety: 0,
    depression: 0,
    stress: 0,
    weeklyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  useEffect(() => {
    // Fetch sentiment data when component mounts
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4002/api/analyzeConversation",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setSentimentData(data);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      // Set mock data if API call fails
      setSentimentData({
        sentiment: 65,
        anxiety: 42,
        depression: 35,
        stress: 48,
        weeklyData: [
          {
            date: "03/01",
            sentiment: 58,
            anxiety: 50,
            depression: 42,
            stress: 55,
          },
          {
            date: "03/02",
            sentiment: 60,
            anxiety: 47,
            depression: 40,
            stress: 53,
          },
          {
            date: "03/03",
            sentiment: 62,
            anxiety: 45,
            depression: 38,
            stress: 51,
          },
          {
            date: "03/04",
            sentiment: 63,
            anxiety: 44,
            depression: 37,
            stress: 50,
          },
          {
            date: "03/05",
            sentiment: 64,
            anxiety: 43,
            depression: 36,
            stress: 49,
          },
          {
            date: "03/06",
            sentiment: 65,
            anxiety: 42,
            depression: 35,
            stress: 48,
          },
          {
            date: "03/07",
            sentiment: 67,
            anxiety: 40,
            depression: 33,
            stress: 46,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureCardClick = (feature) => {
    switch (feature) {
      case "sentiment-analysis":
        setShowSentimentAnalysis(true);
        break;
      case "virtual-environments":
        alert("Launching 3D Virtual Environment...");
        break;
      case "games":
        alert("Opening Neural Games...");
        break;
      default:
        break;
    }
  };

  const handleBackToStart = () => {
    alert("Redirecting to NeuroNav.js page...");
  };

  const getMoodLabel = (sentiment) => {
    if (sentiment >= 80) return "Very Positive";
    if (sentiment >= 60) return "Positive";
    if (sentiment >= 40) return "Neutral";
    if (sentiment >= 20) return "Negative";
    return "Very Negative";
  };

  const getStressLevel = (stress) => {
    if (stress <= 30) return "Low";
    if (stress <= 60) return "Moderate";
    return "High";
  };

  const getEmotionalState = (anxiety, depression) => {
    const average = (anxiety + depression) / 2;
    if (average <= 30) return "Stable";
    if (average <= 60) return "Mixed";
    return "Concerning";
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#19212E",
            padding: "10px",
            border: "1px solid #2A3346",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: "2px 0" }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Sentiment Analysis Component
  const SentimentAnalysisView = () => {
    if (loading) {
      return (
        <div
          style={{
            backgroundColor: "#19212E",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
          }}
        >
          <div
            style={{
              animation: "spin 2s linear infinite",
              marginBottom: "20px",
            }}
          >
            <Brain size={48} color="#8454EE" />
          </div>
          <p>Analyzing conversation sentiment...</p>
        </div>
      );
    }

    return (
      <div
        style={{
          backgroundColor: "#19212E",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Brain size={24} color="#8454EE" />
            Conversation Sentiment Analysis
          </div>

          <Button onClick={() => setShowSentimentAnalysis(false)}>
            Close Analysis
          </Button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <MetricCard
            icon={<Heart size={24} color="#8454EE" />}
            title="Overall Mood"
            value={getMoodLabel(sentimentData.sentiment)}
            color="#8454EE"
          />

          <MetricCard
            icon={<Target size={24} color="#EF4444" />}
            title="Stress Level"
            value={getStressLevel(sentimentData.stress)}
            color="#EF4444"
          />

          <MetricCard
            icon={<Activity size={24} color="#3B82F6" />}
            title="Emotional State"
            value={getEmotionalState(
              sentimentData.anxiety,
              sentimentData.depression
            )}
            color="#3B82F6"
          />
        </div>

        <div style={{ height: "300px", marginTop: "30px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sentimentData.weeklyData}
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <XAxis dataKey="date" stroke="#8c9abe" />
              <YAxis domain={[0, 100]} stroke="#8c9abe" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                name="Sentiment"
                dataKey="sentiment"
                stroke="#8454EE"
                strokeWidth={2}
                dot={{ fill: "#8454EE", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                name="Anxiety"
                dataKey="anxiety"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                name="Depression"
                dataKey="depression"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                name="Stress"
                dataKey="stress"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <Button secondary>Export Analysis</Button>
          <Button>Generate Detailed Report</Button>
        </div>
      </div>
    );
  };

  const MetricCard = ({ icon, title, value, color }) => (
    <div
      style={{
        backgroundColor: "rgba(25, 33, 46, 0.7)",
        padding: "15px",
        borderRadius: "10px",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          gap: "10px",
        }}
      >
        {icon}
        <div style={{ fontSize: "14px" }}>{title}</div>
      </div>

      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</div>
    </div>
  );

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#131928",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: "240px",
            backgroundColor: "#19212E",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "40px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "#8454EE",
                borderRadius: "8px",
                marginRight: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              N
            </div>
            NeuroNav
          </div>

          <NavItem active={true} icon="📊" label="Dashboard" />
          <NavItem icon="📈" label="Analytics" />
          <NavItem icon="⚙️" label="Settings" />
          <NavItem icon="📁" label="Projects" />
          <NavItem icon="👤" label="Profile" />

          <div style={{ marginTop: "auto" }}>
            <NavItem
              icon="🔙"
              label="Back to Start"
              onClick={handleBackToStart}
            />
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "30px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              Neural Dashboard
            </div>

            <div
              style={{
                position: "relative",
                width: "260px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                🔍
              </div>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: "100%",
                  padding: "10px 15px 10px 40px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#19212E",
                  color: "white",
                  fontSize: "14px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{ fontWeight: "500" }}>Admin User</div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#8454EE",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                👤
              </div>
            </div>
          </div>
          {showSentimentAnalysis && <SentimentAnalysisView />}

          {/* Feature Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <FeatureCard
              id="virtual-environments"
              icon="🌐"
              title="3D Virtual Environments"
              content="Explore immersive neural landscapes"
              buttonText="Launch Environment"
              onClick={() => handleFeatureCardClick("virtual-environments")}
            />

            <div
              style={{
                backgroundColor: "#19212E",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(132, 84, 238, 0.2)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  🤖
                </div>
                Sentiment Analysis Bot
              </div>

              <p>Analyze emotional data patterns</p>

              {/* Buttons Container */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button
                  onClick={() => handleFeatureCardClick("sentiment-analysis")}
                  style={{
                    flex: 1,
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#8454EE",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                  }}
                >
                  Run Analysis
                </button>

                <button
                  onClick={() =>
                    (window.location.href = "http://localhost:3001")
                  }
                  style={{
                    flex: 1,
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#8454EE",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                  }}
                >
                  Start Another Conversation
                </button>
              </div>
            </div>

            <FeatureCard
              id="games"
              icon="🎮"
              title="Neural Games"
              content="Cognitive training through play"
              buttonText="Play Now"
              onClick={() => handleFeatureCardClick("games")}
            />

            <div
              style={{
                backgroundColor: "#19212E",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(132, 84, 238, 0.2)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  📊
                </div>
                Performance Metrics
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                <StatItem value="92%" label="Accuracy" />
                <StatItem value="3.2ms" label="Response Time" />
                <StatItem value="8.7k" label="Processes" />
                <StatItem value="64GB" label="Memory Usage" />
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div
            style={{
              backgroundColor: "#19212E",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                Neural Activity Overview
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <Button secondary>Export Data</Button>
                <Button>Real-time View</Button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {["Last 24 Hours", "Week", "Month", "Quarter"].map((tab) => (
                <div
                  key={tab}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    backgroundColor:
                      activeTab === tab
                        ? "#8454EE"
                        : "rgba(255, 255, 255, 0.05)",
                    color: activeTab === tab ? "white" : "inherit",
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div
              style={{
                height: "300px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(180deg, rgba(132, 84, 238, 0.2) 0%, rgba(132, 84, 238, 0) 100%)",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "100px",
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100" viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0,50 C150,20 300,80 450,50 C600,20 750,60 900,40 L900,100 L0,100 Z" fill="%238454EE" opacity="0.4"/></svg>')`,
                    backgroundSize: "100% 100%",
                  }}
                ></div>

                <Pulse
                  style={{ top: "30%", left: "20%", animationDelay: "0s" }}
                />
                <Pulse
                  style={{ top: "60%", left: "45%", animationDelay: "0.3s" }}
                />
                <Pulse
                  style={{ top: "40%", left: "75%", animationDelay: "0.7s" }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "#19212E",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(132, 84, 238, 0.2)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  📈
                </div>
                Recent Activity
              </div>

              <div style={{ marginBottom: "15px" }}>
                <ActivityItem
                  label="Sentiment Analysis Session"
                  time="2 hours ago"
                />
                <ActivityItem
                  label="Neural Training Complete"
                  time="Yesterday"
                />
                <ActivityItem label="Model Update" time="2 days ago" />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "15px",
                }}
              >
                <Button secondary>View All</Button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#19212E",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(132, 84, 238, 0.2)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  🚀
                </div>
                Quick Actions
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <Button>Run Scan</Button>
                <Button>New Project</Button>
                <Button>Generate Report</Button>
                <Button>Share Results</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const NavItem = ({ icon, label, active, onClick }) => (
  <div
    style={{
      padding: "12px 15px",
      borderRadius: "8px",
      marginBottom: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      backgroundColor: active ? "#8454EE" : "transparent",
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (!active)
        e.currentTarget.style.backgroundColor = "rgba(132, 84, 238, 0.2)";
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.backgroundColor = "transparent";
    }}
  >
    <div
      style={{
        width: "20px",
        height: "20px",
        marginRight: "12px",
      }}
    >
      {icon}
    </div>
    {label}
  </div>
);

const FeatureCard = ({ id, icon, title, content, buttonText, onClick }) => (
  <div
    id={id}
    style={{
      backgroundColor: "#19212E",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      height: "180px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      zIndex: 1,
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-5px)";
      e.currentTarget.style.boxShadow = "0 8px 25px rgba(132, 84, 238, 0.2)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
    }}
  >
    <div
      style={{
        position: "absolute",
        bottom: "-20px",
        right: "-20px",
        fontSize: "120px",
        opacity: "0.1",
        color: "#8454EE",
        zIndex: -1,
      }}
    >
      {icon}
    </div>

    <div
      style={{
        content: "",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(45deg, rgba(132, 84, 238, 0.4), transparent)",
        borderRadius: "12px",
        zIndex: -1,
      }}
    ></div>

    <div
      style={{
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "15px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: "rgba(132, 84, 238, 0.2)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      {title}
    </div>

    <div style={{ marginBottom: "15px" }}>{content}</div>

    <div
      style={{
        backgroundColor: "#8454EE",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        justifyContent: "center",
        width: "fit-content",
      }}
    >
      {buttonText}
    </div>
  </div>
);

const StatItem = ({ value, label }) => (
  <div style={{ marginBottom: "10px" }}>
    <div
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "5px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: "12px",
        color: "#8c9abe",
      }}
    >
      {label}
    </div>
  </div>
);

const Button = ({ children, secondary, onClick }) => (
  <div
    style={{
      backgroundColor: secondary ? "transparent" : "#8454EE",
      color: "white",
      border: secondary ? "1px solid #8454EE" : "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      justifyContent: "center",
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (secondary) {
        e.currentTarget.style.backgroundColor = "rgba(132, 84, 238, 0.1)";
      } else {
        e.currentTarget.style.backgroundColor = "#7040d0";
      }
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = secondary
        ? "transparent"
        : "#8454EE";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    {children}
  </div>
);

const ActivityItem = ({ label, time }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px",
    }}
  >
    <div>{label}</div>
    <div>{time}</div>
  </div>
);

const Pulse = ({ style }) => (
  <div
    style={{
      position: "absolute",
      width: "10px",
      height: "10px",
      backgroundColor: "#8454EE",
      borderRadius: "50%",
      animation: "pulse 2s infinite",
      ...style,
    }}
  ></div>
);

export default NeuroNavDashboard;
