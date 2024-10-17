import {useState} from "react";
import {Field, Form, Formik} from "formik";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import Dropzone, {FileRejection} from "react-dropzone";
import {ReloadIcon} from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {CircleX, Cross} from "lucide-react";
import {pinata} from "@/utils/config";
import {toast} from "sonner";

export default function AddPost() {
  const getCanvasDimensions = (canvasSize: string) => {
    const [width, height] = canvasSize.split("x").map(Number);
    console.log(width, height, "width, height");
    return {width, height};
  };

  const [canvasSize, setCanvasSize] = useState<string>("1080x1080");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(file);
        setImageUrl(reader.result as string); // Set the image URL, cast as string
      };
      reader.readAsDataURL(file); // Read the file as a data URL for preview
    }
  };

  const renderImageStyles = (canvasSize: string) => {
    const {width, height} = getCanvasDimensions(canvasSize);

    // For other sizes, use default aspect ratio scaling
    return {
      width: "100%", // Responsive width
      maxWidth: `${width / 2}px`, // Default scaling for all other sizes
      maxHeight: `${height / 2}px`, // Maintain aspect ratio
    };
  };

  const uploadFile = async () => {
    if (!file) {
      // alert("No file selected");
      toast.error("No file selected");
      return;
    }

    try {
      setUploading(true);
      const keyRequest = await fetch("/api/upload");
      const keyData = await keyRequest.json();
      const upload = await pinata.upload.file(file).key(keyData.JWT);
      console.log(upload);
      setIpfsUrl(upload.IpfsHash);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-white text-black flex justify-center items-center">
      <Formik
        initialValues={{description: "", uploadedImageUrl: "", canvasSize: ""}}
        onSubmit={(values) => {
          console.log(ipfsUrl, values, "Form Values");
        }}
      >
        {(formik) => (
          <Form className="h-full w-full flex flex-col gap-4 p-10 lg:flex-row-reverse">
            <div className="flex flex-col gap-6 w-full">
              <p className="text-xl text-center font-semibold">Add Post</p>
              <div className="flex justify-start gap-3 flex-col">
                <Label htmlFor="description">Image Description</Label>
                <Field
                  as={Textarea}
                  name="description"
                  placeholder="Description"
                  rows="10"
                  className="w-full"
                />
              </div>
              <div className="flex justify-start gap-3 flex-col">
                <Label htmlFor="canvasSize">Canvas</Label>
                <Select
                  onValueChange={(value) => {
                    setCanvasSize(value);
                    formik.setFieldValue("canvasSize", value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Canvas Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1080x1080">
                      Instagram Post (Square) 1080px 1080px
                    </SelectItem>
                    <SelectItem value="1080x566">
                      Instagram (Landscape) 1080px 566px
                    </SelectItem>
                    <SelectItem value="1200x630">
                      Facebook Post 1200px 630px
                    </SelectItem>
                    <SelectItem value="820x312">
                      Facebook Cover Photo 820px 312px
                    </SelectItem>
                    <SelectItem value="1024x512">
                      Twitter Post 1024px 512px
                    </SelectItem>
                    <SelectItem value="1500x500">
                      Twitter Header 1500px 500px
                    </SelectItem>
                    <SelectItem value="1200x627">
                      LinkedIn Post 1200px 627px
                    </SelectItem>
                    <SelectItem value="1584x396">
                      LinkedIn Cover Photo 1584px 396px
                    </SelectItem>
                    <SelectItem value="1000x1500">
                      Pinterest Pin 1000px 1500px
                    </SelectItem>
                    <SelectItem value="1280x720">
                      YouTube Thumbnail 1280px 720px
                    </SelectItem>
                    <SelectItem value="2560x1440">
                      YouTube Channel Art 2560px 1440px
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  {ipfsUrl && (
                    <a
                      href={"https://gateway.pinata.cloud/ipfs/" + ipfsUrl}
                      className="font-medium text-blue-700 dark:text-blue-600 hover:underline text-sm"
                    >
                      Click Here to View
                    </a>
                  )}
                </div>
                {uploading && ipfsUrl === "" ? (
                  <Button variant="outline" className="w-full" disabled>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </Button>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={imageUrl === "" || ipfsUrl !== ""}
                      onClick={uploadFile}
                    >
                      Upload to IPFS
                    </Button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-full border border-slate-800 focus-visible:ring-0"
              >
                Create Post
              </Button>
            </div>

            <div className="h-full w-full">
              {/* Image Upload with Preview */}
              <div className="flex justify-start gap-3 flex-col"></div>
              <div className="w-full h-[400px] lg:h-full border-2 rounded-xl flex justify-center items-center">
                {imageUrl ? (
                  <div
                    className="rounded h-1/2 w-1/2 relative border-2 justify-center items-center flex bg-slate-200 duration-1000 animate-in ease-in-out"
                    style={renderImageStyles(canvasSize)}
                  >
                    <div
                      className="absolute -top-3 -right-3 cursor-pointer"
                      onClick={() => setImageUrl("")}
                    >
                      <CircleX className="w-8 h-8 fill-black text-white cursor-pointer" />
                    </div>
                    {/* Get the selected canvas dimensions */}
                    <img
                      src={imageUrl}
                      alt="preview"
                      className={`absolute top-0 left-0 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                        imgLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setImgLoaded(true)}
                    />
                  </div>
                ) : (
                  <Dropzone onDrop={handleDrop}>
                    {({getRootProps, getInputProps}) => (
                      <div className="w-full h-full rounded-xl">
                        <div
                          {...getRootProps()}
                          className="h-full w-full flex justify-center items-center"
                        >
                          <input {...getInputProps()} />
                          <p>
                            Drag 'n' drop some files here, or click to select
                            files
                          </p>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
