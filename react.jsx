import React, { useEffect, useState } from "react";

export default function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://opentdb.com/api.php?amount=10&type=multiple"
        );
        const data = await res.json();
        if (data.response_code !== 0) throw new Error("No questions found.");
        // Format answers (shuffle correct + incorrect)
        const formatted = data.results.map((q) => {
          const answers = [...q.incorrect_answers];
          const randomIndex = Math.floor(Math.random() * (answers.length + 1));
          answers.splice(randomIndex, 0, q.correct_answer);
          return { ...q, answers };
        });
        setQuestions(formatted);
      } catch (err) {
        setError("Failed to fetch quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswer = (answer) => {
    setSelected(answer);
    if (answer === questions[current].correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    } else {
      setShowResults(true);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading quiz...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  if (showResults) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Quiz Completed 🎉</h1>
        <p className="text-lg mb-2">
          You scored <span className="font-bold">{score}</span> out of{" "}
          {questions.length}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  const currentQ = questions[current];

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Question {current + 1} of {questions.length}
        </h2>
        <p
          className="text-base mb-6"
          dangerouslySetInnerHTML={{ __html: currentQ.question }}
        />
        <div className="grid gap-3">
          {currentQ.answers.map((ans, idx) => {
            let btnClass =
              "px-4 py-2 border rounded-lg text-left transition-colors";
            if (selected) {
              if (ans === currentQ.correct_answer) {
                btnClass += " bg-green-200 border-green-500";
              } else if (ans === selected && ans !== currentQ.correct_answer) {
                btnClass += " bg-red-200 border-red-500";
              } else {
                btnClass += " bg-gray-100 border-gray-300";
              }
            } else {
              btnClass += " hover:bg-blue-100 border-gray-300";
            }

            return (
              <button
                key={idx}
                className={btnClass}
                onClick={() => !selected && handleAnswer(ans)}
                dangerouslySetInnerHTML={{ __html: ans }}
              />
            );
          })}
        </div>
        {selected && (
          <button
            onClick={handleNext}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
          >
            {current + 1 === questions.length ? "Finish Quiz" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}
