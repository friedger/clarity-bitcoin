export interface IMerkleHashes {
  level: number;
  hashes: string[];
}
export class MerkleTree {
  private hashes: IMerkleHashes[] = [];
  private hashFunction: any | undefined;
  public constructor(array: any[], hashFunction?: any) {
    this.checkInput(array);
    this.hashFunction = hashFunction;
    this.generateTree(array);
  }

  public verify(
    proof: string[] | number[],
    leaf: string | number,
    rootHash: string | number,
    index: number
  ) {
    let hash = leaf;
    for (let i = 0; i < proof.length; i++) {
      if (index % 2 === 0) {
        hash = this.hashFunction(`${hash}${proof[i]}`);
      } else {        
        hash = this.hashFunction(`${proof[i]}${hash}`);
      }
      index = Math.floor(index / 2);
    }
    return hash === rootHash;
  }

  public getRootHash(): string {
    return this.hashes.filter(
      (e: IMerkleHashes) =>
        e.level === this.hashes[this.hashes.length - 1].level
    )[0].hashes[0];
  }

  public getProofElements(investigatedEntryIndex: number): string[] {
    let level = 0;
    const levels = this.hashes[this.hashes.length - 1].level;
    let relevantIndex = investigatedEntryIndex;
    const proofElements: string[] = [];
    while (level < levels) {
      relevantIndex =
        level === 0
          ? investigatedEntryIndex
          : this.getRelevantIndex(relevantIndex);
      const isLeftNode = relevantIndex % 2 === 0;
      if (isLeftNode) {
        proofElements.push(
          this.hashes.filter((e: IMerkleHashes) => e.level === level)[0].hashes[
            relevantIndex + 1
          ]
        );
        // same level proof comes from right
      } else {
        proofElements.push(
          this.hashes.filter((e: IMerkleHashes) => e.level === level)[0].hashes[
            relevantIndex - 1
          ]
        );
        // same level proof comes from left
      }
      level++;
    }
    return proofElements;
  }

  public getHashes(): IMerkleHashes[] {
    return this.hashes;
  }

  public getRelevantIndex(previousIndex: number): number {
    return Math.floor(previousIndex / 2);
  }
  private generateTree(array: any[]) {
    let level = 0;
    let itemsOnThisLevel = array;

    while (itemsOnThisLevel.length > 1) {
      itemsOnThisLevel = this.getHashesForLevel(level, itemsOnThisLevel);
      this.hashes.push({ level, hashes: itemsOnThisLevel });
      level++;
    }
  }

  private getHashesForLevel(level: number, array: any[]): string[] {
    const hashesOnThisLevel: string[] = [];
    if (array.length % 2 == 1) {
      array.push(array[array.length - 1]);
    }
    for (let i = 0; i < array.length; i++) {
      if (level === 0) {
        hashesOnThisLevel.push(array[i]);
      } else if (i % 2 === 0) {
        const hash = this.hashFunction(`${array[i]}${array[i + 1]}`);
        hashesOnThisLevel.push(hash);
      }
    }
    return hashesOnThisLevel;
  }

  private checkInput(array: any[]) {}
}
