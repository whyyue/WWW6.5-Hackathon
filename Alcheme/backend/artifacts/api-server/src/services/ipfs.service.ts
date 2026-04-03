import { PinataSDK } from "pinata";

let pinataClient: PinataSDK | null = null;

function getPinata(): PinataSDK {
  if (!pinataClient) {
    const jwt = process.env["PINATA_JWT"];
    if (!jwt) {
      throw new Error("PINATA_JWT 未配置，请在环境变量中设置 Pinata API Key");
    }
    pinataClient = new PinataSDK({ pinataJwt: jwt });
  }
  return pinataClient;
}

export interface BadgeMetadata {
  name: string;
  description: string;
  tokenId: string;
  cardIds: number[];
  imageBase64?: string;
}

export interface IpfsUploadResult {
  metadataCid: string;
  imageCid?: string;
  metadataUrl: string;
  imageUrl?: string;
}

export async function uploadBadgeToIpfs(
  metadata: BadgeMetadata,
  imageBuffer?: Buffer,
): Promise<IpfsUploadResult> {
  const pinata = getPinata();
  let imageCid: string | undefined;

  if (imageBuffer) {
    const imageFile = new File([imageBuffer], `${metadata.tokenId}.png`, {
      type: "image/png",
    });
    const imageUpload = await pinata.upload.public.file(imageFile);
    imageCid = imageUpload.cid;
  }

  const nftMetadata = {
    name: metadata.name,
    description: metadata.description,
    tokenId: metadata.tokenId,
    cardIds: metadata.cardIds,
    image: imageCid ? `ipfs://${imageCid}` : undefined,
    attributes: [
      { trait_type: "Token ID", value: metadata.tokenId },
      { trait_type: "Card Count", value: metadata.cardIds.length },
    ],
  };

  const metaUpload = await pinata.upload.public.json(nftMetadata);
  const metadataCid = metaUpload.cid;

  return {
    metadataCid,
    imageCid,
    metadataUrl: `ipfs://${metadataCid}`,
    imageUrl: imageCid ? `ipfs://${imageCid}` : undefined,
  };
}
