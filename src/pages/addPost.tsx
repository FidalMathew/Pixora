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

export default function AddPost() {
  const getCanvasDimensions = (canvasSize: string) => {
    const [width, height] = canvasSize.split("x").map(Number);
    return {width, height};
  };

  const [canvasSize, setCanvasSize] = useState<string>("1080x1080");
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleDrop = (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
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

  return (
    <div className="h-screen w-full bg-white text-black flex justify-center items-center">
      <Formik
        initialValues={{description: "", uploadedImageUrl: ""}}
        onSubmit={(values) => console.log(values)}
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
                <Select onValueChange={setCanvasSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Canvas Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1080x1080">
                      Instagram Post (Square) 1080px 1080px
                    </SelectItem>
                    <SelectItem value="1080x1350">
                      Instagram Post (Portrait) 1080px 1350px
                    </SelectItem>
                    <SelectItem value="1080x566">
                      Instagram Post (Landscape) 1080px 566px
                    </SelectItem>
                    <SelectItem value="1080x1920">
                      Instagram Story 1080px 1920px
                    </SelectItem>
                    <SelectItem value="1200x630">
                      Facebook Post 1200px 630px
                    </SelectItem>
                    <SelectItem value="820x312">
                      Facebook Cover Photo 820px 312px
                    </SelectItem>
                    <SelectItem value="1920x1005">
                      Facebook Event Cover 1920px 1005px
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
                <p className="pl-1 pt-5">
                  IPFS: https://mail.google.com/mail/u/0/#inbox{" "}
                </p>
              </div>
              <div className="flex justify-between items-center w-full">
                <Button variant="outline" className="w-full">
                  Upload to IPFS
                </Button>
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
              <div className="w-full h-full border-2 rounded-xl flex justify-center items-center">
                {imageUrl ? (
                  <div
                    className="rounded h-1/2 w-1/2 relative border-2 justify-center items-center flex bg-slate-200"
                    style={renderImageStyles(canvasSize)}
                  >
                    {/* Get the selected canvas dimensions */}
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="absolute top-0 left-0 h-full w-full object-contain"
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
