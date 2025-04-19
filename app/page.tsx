"use client";

// אפליקציית Miki Smart - תחזית חכמה לליגת LA LIGA
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TeamStats {
  position: number;
  goalsPerGame: number;
}

interface ScorePrediction {
  home: number;
  away: number;
}

interface Game {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeStats: TeamStats;
  awayStats: TeamStats;
  prediction: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  exactScore: ScorePrediction;
}

interface StandingTeam {
  position: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  team: {
    id: number;
    name: string;
  };
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [search, setSearch] = useState<string>("");
  const [standings, setStandings] = useState<StandingTeam[]>([]);

  useEffect(() => {
    const fetchGames = fetch("https://api.football-data.org/v4/competitions/PD/matches?status=SCHEDULED", {
      headers: {
        "X-Auth-Token": "4d10b18df7541e6bdad6e76cbb3d392"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const parsedGames: Game[] = data.matches.map((match: any) => {
          const homeStats = {
            position: Math.floor(Math.random() * 20) + 1,
            goalsPerGame: Math.random() * 2 + 0.5,
          };
          const awayStats = {
            position: Math.floor(Math.random() * 20) + 1,
            goalsPerGame: Math.random() * 2 + 0.5,
          };

          const gameBase = {
            date: new Date(match.utcDate).toLocaleDateString(),
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            homeStats,
            awayStats,
          };

          return {
            ...gameBase,
            prediction: calculatePrediction({ ...gameBase, homeStats, awayStats }),
            exactScore: predictExactScore({ ...gameBase, homeStats, awayStats }),
          };
        });

        setGames(parsedGames);
      });

    const fetchStandings = fetch("https://api.football-data.org/v4/competitions/PD/standings", {
      headers: {
        "X-Auth-Token": "4d10b18df7541e6bdad6e76cbb3d392"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setStandings(data.standings[0].table);
      });

    Promise.all([fetchGames, fetchStandings]).catch((err) => console.error("Error loading data", err));
  }, []);

  function calculatePrediction(game: Game) {
    const { homeStats, awayStats } = game;
    let homeScore = 0;
    let drawScore = 0;
    let awayScore = 0;

    homeScore += (20 - homeStats.position) * 2;
    awayScore += (20 - awayStats.position) * 2;

    homeScore += homeStats.goalsPerGame * 10;
    awayScore += awayStats.goalsPerGame * 10;

    homeScore += 10;

    const total = homeScore + awayScore + drawScore + 1;
    return {
      homeWin: Math.round((homeScore / total) * 100),
      draw: Math.round((drawScore / total) * 100),
      awayWin: Math.round((awayScore / total) * 100),
    };
  }

  function predictExactScore(game: Game): ScorePrediction {
    const { homeStats, awayStats } = game;
    let home = homeStats.goalsPerGame + (20 - homeStats.position) * 0.05 + 0.3;
    let away = awayStats.goalsPerGame + (20 - awayStats.position) * 0.05;

    if (homeStats.position <= 5) home += 0.3;
    if (awayStats.position <= 5) away += 0.3;

    return {
      home: Math.max(0, Math.round(home)),
      away: Math.max(0, Math.round(away)),
    };
  }

  const filteredGames = games.filter((game) =>
    game.homeTeam.toLowerCase().includes(search.toLowerCase()) ||
    game.awayTeam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-blue-900 to-blue-600 min-h-screen text-white">
      <h1 className="text-4xl font-extrabold text-center mb-4 drop-shadow-lg">⚽ Miki Smart - תחזית משחקי LA LIGA</h1>

      <div className="flex justify-center">
        <Input
          type="text"
          placeholder="חפש קבוצה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm text-black"
        />
      </div>

      <div className="bg-white/10 rounded-xl p-4 mt-6">
        <h2 className="text-xl font-semibold text-center mb-2">טבלת הליגה</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/80">
                <th>#</th>
                <th>קבוצה</th>
                <th>משחקים</th>
                <th>ניצחונות</th>
                <th>תיקו</th>
                <th>הפסדים</th>
                <th>נקודות</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => (
                <tr key={team.team.id} className="border-b border-white/10">
                  <td>{team.position}</td>
                  <td>{team.team.name}</td>
                  <td>{team.playedGames}</td>
                  <td>{team.won}</td>
                  <td>{team.draw}</td>
                  <td>{team.lost}</td>
                  <td>{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredGames.length === 0 && <p className="text-center animate-pulse">טוען משחקים...</p>}

      {filteredGames.map((game, index) => (
        <Card key={index} className="rounded-2xl shadow-xl border border-white/10 bg-white/10 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-xl font-semibold">
                {game.homeTeam} vs {game.awayTeam}
              </div>
              <div className="text-sm text-gray-300">{game.date}</div>
            </div>
            <div className="mt-2">
              <p className="font-medium">סיכויי ניצחון:</p>
              <ul className="text-sm mt-1 space-y-1">
                <li>🏠 {game.homeTeam}: {game.prediction.homeWin}%</li>
                <li>🤝 תיקו: {game.prediction.draw}%</li>
                <li>🛫 {game.awayTeam}: {game.prediction.awayWin}%</li>
              </ul>
              <div className="mt-2 bg-white/20 rounded-lg p-2 text-sm">
                תחזית מדויקת: <strong>{game.homeTeam} {game.exactScore.home} - {game.exactScore.away} {game.awayTeam}</strong>
              </div>
            </div>
            <div className="mt-4 text-right">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white/20"
                onClick={() => setSelectedGame(game)}
              >
                פרטים נוספים
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle>
              {selectedGame?.homeTeam} vs {selectedGame?.awayTeam}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <p>תאריך: {selectedGame?.date}</p>
            <p>מיקום בית: {selectedGame?.homeStats.position}, שערים למשחק: {selectedGame?.homeStats.goalsPerGame.toFixed(2)}</p>
            <p>מיקום חוץ: {selectedGame?.awayStats.position}, שערים למשחק: {selectedGame?.awayStats.goalsPerGame.toFixed(2)}</p>
            <p><strong>תחזית תוצאה מדויקת:</strong> {selectedGame?.homeTeam} {selectedGame?.exactScore.home} - {selectedGame?.exactScore.away} {selectedGame?.awayTeam}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
