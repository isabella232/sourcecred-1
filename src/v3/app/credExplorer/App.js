// @flow

import React from "react";
import {StyleSheet, css} from "aphrodite/no-important";

import LocalStore from "./LocalStore";
import {createPluginAdapter as createGithubAdapter} from "../../plugins/github/pluginAdapter";
import {createPluginAdapter as createGitAdapter} from "../../plugins/git/pluginAdapter";
import {Graph} from "../../core/graph";

type Props = {};
type State = {
  repoOwner: string,
  repoName: string,
};

const REPO_OWNER_KEY = "repoOwner";
const REPO_NAME_KEY = "repoName";

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      repoOwner: "",
      repoName: "",
    };
  }

  componentDidMount() {
    this.setState((state) => ({
      repoOwner: LocalStore.get(REPO_OWNER_KEY, state.repoOwner),
      repoName: LocalStore.get(REPO_NAME_KEY, state.repoName),
    }));
  }

  render() {
    return (
      <div>
        <header className={css(styles.header)}>
          <h1>Cred Explorer</h1>
        </header>
        <p>Welcome to the SourceCred Explorer!</p>
        <div>
          <label>
            Repository owner:
            <input
              value={this.state.repoOwner}
              onChange={(e) => {
                const value = e.target.value;
                this.setState({repoOwner: value}, () => {
                  LocalStore.set(REPO_OWNER_KEY, this.state.repoOwner);
                });
              }}
            />
          </label>
          <br />
          <label>
            Repository name:
            <input
              value={this.state.repoName}
              onChange={(e) => {
                const value = e.target.value;
                this.setState({repoName: value}, () => {
                  LocalStore.set(REPO_NAME_KEY, this.state.repoName);
                });
              }}
            />
          </label>
          <br />
          <button onClick={() => this.loadData()}>Load data</button>
        </div>
      </div>
    );
  }

  loadData() {
    const validRe = /^[A-Za-z0-9_-]+$/;
    const {repoOwner, repoName} = this.state;
    if (!repoOwner.match(validRe)) {
      console.error(`Invalid repository owner: ${JSON.stringify(repoOwner)}`);
      return;
    }
    if (!repoName.match(validRe)) {
      console.error(`Invalid repository name: ${JSON.stringify(repoName)}`);
      return;
    }

    const githubGraphPromise = createGithubAdapter(repoOwner, repoName).then(
      (githubAdapter) => {
        const graph = githubAdapter.graph();
        const nodeCount = Array.from(graph.nodes()).length;
        const edgeCount = Array.from(graph.edges()).length;
        console.log(
          `GitHub: Loaded graph: ${nodeCount} nodes, ${edgeCount} edges.`
        );
        return graph;
      }
    );

    const gitGraphPromise = createGitAdapter(repoOwner, repoName).then(
      (gitAdapter) => {
        const graph = gitAdapter.graph();
        const nodeCount = Array.from(graph.nodes()).length;
        const edgeCount = Array.from(graph.edges()).length;
        console.log(
          `Git: Loaded graph: ${nodeCount} nodes, ${edgeCount} edges.`
        );
        return graph;
      }
    );

    Promise.all([gitGraphPromise, githubGraphPromise]).then((graphs) => {
      const graph = Graph.merge(graphs);
      const nodeCount = Array.from(graph.nodes()).length;
      const edgeCount = Array.from(graph.edges()).length;
      console.log(
        `Combined: Loaded graph: ${nodeCount} nodes, ${edgeCount} edges.`
      );
    });
  }
}

const styles = StyleSheet.create({
  header: {
    color: "#090",
  },
});
