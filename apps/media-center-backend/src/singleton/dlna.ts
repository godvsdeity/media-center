import dlnacasts2 from "dlnacasts2";

export const dlnaList = dlnacasts2();

export function findDlnaPlayer(playerRef): any {
  return dlnaList.players.find((player) => player.host === playerRef);
}

dlnaList.players.forEach((dlnaPlayer: Record<string, any>) =>
  dlnaPlayer.on("error", console.error.bind(console))
);
dlnaList.on("update", (dlnaPlayer: Record<string, any>) =>
  dlnaPlayer.on("error", console.error.bind(console))
);

setInterval(() => {
  dlnaList.update();
}, 60000);
