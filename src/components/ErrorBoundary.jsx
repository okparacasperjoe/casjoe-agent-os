import React from 'react';
export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, info: null }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, info) { this.setState({ error, info }); console.error(error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-900/20 border border-red-500 rounded-xl m-4 text-white">
          <h2 className="text-xl font-bold text-red-400 mb-2">Component Crashed</h2>
          <pre className="text-xs overflow-auto text-red-200">{this.state.error?.toString()}</pre>
          <pre className="text-xs overflow-auto mt-2 text-slate-400">{this.state.info?.componentStack}</pre>
          <button onClick={() => this.setState({ hasError: false })} className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white text-sm">Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
