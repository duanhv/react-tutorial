import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  render() {
    let className = (this.props.checked || this.props.won) ? 'square-bold' : 'square';
    return (
      <button className={className} onClick={ () => this.props.onClick()}>
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {

  renderSquare(i, checked, won) {
    return <Square key={'index_'+i} value={this.props.squares[i]} onClick={() => this.props.onClick(i)} checked={checked} won={won} />;
  }

  renderIndex(i) {
    return <Square key={i} value={i} onClick={() => null}/>
  }

  render() {
    let rowNum = this.props.rows;
    let colNum = this.props.columns;
    let lastMove = this.props.lastMove;
    let wonLine = this.props.wonLine ? this.props.wonLine : [];
    let rows = []
    //index
    let headers = [this.renderIndex('')];
    for (let j=0; j<colNum; j++) {
     headers.push(this.renderIndex(j+1));
    }
    rows.push(headers);

    for (let i=0; i<rowNum; i++) {
      let row = [this.renderIndex(i+1)];
      for (let j=0; j<colNum; j++) {
        let index = i*colNum+j;
        row.push(this.renderSquare(index, index === lastMove, index in wonLine));
      }
      rows.push(<div key={i} className="board-row">{row.slice()}</div>);
    }
    return (
      <div>
          {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastMove: null,
      }],
      xIsNext: true,
      stepNumber: 0,
      rows: 8,
      columns: 22,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares, this.state.columns, current.lastMove) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastMove: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
    console.log(i);
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const wonLine = calculateWinner(current.squares, this.state.columns, current.lastMove);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #'+ move+' ('+ Math.floor(step.lastMove/this.state.columns+1)+', '+(step.lastMove % this.state.columns+1) + ')':
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (wonLine) {
      status = 'winner: ' + current.squares[wonLine[0]];
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            rows = {this.state.rows}
            columns = {this.state.columns}
            lastMove = {current.lastMove}
            wonLine = {wonLine}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares, colNum, lastMove, win_num = 4) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}
