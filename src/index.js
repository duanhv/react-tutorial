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
        row.push(this.renderSquare(index, index === lastMove, wonLine.indexOf(index) > -1 ));
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
      columns: 15,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares, this.state.rows, this.state.columns, current.lastMove) || squares[i]) {
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
    const wonLine = calculateWinner(current.squares, this.state.rows, this.state.columns, current.lastMove);
    console.log("wonLine " + wonLine)
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

function calculateWinner(squares, rowNum, colNum, lastMove, win_num = 5) {
    let matrix = [];
    if (lastMove == null) {
      return null;
    }
    // 1. convert squares array to matrix
    for (let i=0; i< rowNum+2; i++) {
      matrix.push(new Array(colNum+2).fill(null));
    }
    for (let i=0; i<squares.length; i++) {
      matrix[Math.floor(i/colNum)+1][i%colNum+1] = squares[i];
    }

    let [r, c]   = [Math.floor(lastMove/colNum)+1, (lastMove%colNum+1)];

    // 2. moving vetors
    let vectors = [
                   [[1,0], [-1, 0]],
                   [[0,1], [0, -1]],
                   [[1,1], [-1, -1]],
                   [[1,-1], [-1, 1]]
                  ];
    let result = [];

    // 3. detect winner
    for (let vector of vectors) {
      result.push((r-1)*colNum + c -1);
      for (let i=0; i<vector.length; i++) {
       let [r1, c1] = [r + vector[i][0], c + vector[i][1]];
         while (matrix[r1][c1] != null && matrix[r1][c1] === matrix[r][c]) {
            result.push((r1-1)*colNum + c1 - 1);
            [r1, c1] = [r1 + vector[i][0], c1 + vector[i][1]];
         }
      }
      if (result.length >= win_num) {
        break;
      } else {
        result = [];
      }
    }
    return (result.length > 0) ? result : null;
}

