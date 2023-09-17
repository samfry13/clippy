import EventTarget, { Event } from "event-target-shim";
import xhr, { XhrResponse, XhrUrlConfig } from "xhr";
import pProgress, { PProgress } from "p-progress";

const DEFAULT_CHUNK_SIZE = 30 * 1024 * 1024; // 30 MB

type EventName =
  | "chunkAttempt"
  | "chunkSuccess"
  | "error"
  | "progress"
  | "success";

// NOTE: This and the EventTarget definition below could be more precise
// by e.g. typing the detail of the CustomEvent per EventName.
type UploaderEvent = CustomEvent & Event<EventName>;

type ValidMethod = "POST" | "PUT";

export type UploaderOptions = {
  getEndpoint: (
    chunkNumber: number
  ) => Promise<{ url: string; method: ValidMethod }>;
  file: File;
  chunkSize?: number;
  concurrentUploads?: number;
};

export class Uploader {
  public getEndpoint: (
    chunkNumber: number
  ) => Promise<{ url: string; method: ValidMethod }>;
  public file: File;
  public chunkSize: number;
  public concurrentUploads: number;

  private totalChunks: number;

  private eventTarget: EventTarget<Record<EventName, UploaderEvent>>;
  private abortController: AbortController | null;

  constructor(options: UploaderOptions) {
    this.getEndpoint = options.getEndpoint;
    this.file = options.file;
    this.chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
    this.concurrentUploads = options.concurrentUploads ?? 5;

    this.totalChunks = Math.ceil(this.file.size / this.chunkSize);

    this.eventTarget = new EventTarget();
    this.abortController = null;
  }

  public on(
    eventName: EventName,
    fn: (event: CustomEvent) => void,
    options?: { once: boolean }
  ) {
    this.eventTarget.addEventListener(eventName, fn, options);
  }

  public off(eventName: EventName, fn: (event: CustomEvent) => void) {
    this.eventTarget.removeEventListener(eventName, fn);
  }

  public upload() {
    this.sendChunks();
  }

  public abort() {
    this.abortController?.abort();
  }

  private dispatch(eventName: EventName, detail?: any) {
    const event: UploaderEvent = new CustomEvent(eventName, {
      detail,
    }) as UploaderEvent;
    this.eventTarget.dispatchEvent(event);
  }

  private xhrPromise(
    options: XhrUrlConfig,
    signal: AbortSignal
  ): Promise<XhrResponse> {
    return new Promise((resolve, reject) => {
      const request = xhr(options, (err, resp) => {
        if (err) {
          return reject(err);
        }

        return resolve(resp);
      });

      signal.onabort = () => {
        request.abort();
      };
    });
  }

  private async sendChunk(chunkNumber: number, signal: AbortSignal) {
    const rangeStart = this.chunkSize * chunkNumber;
    const rangeEnd = Math.min(rangeStart + this.chunkSize, this.file.size);
    const chunk = this.file.slice(rangeStart, rangeEnd);

    return pProgress(async (progress) => {
      const endpoint = await this.getEndpoint(chunkNumber);

      this.dispatch("chunkAttempt", chunkNumber);

      const resp = await this.xhrPromise(
        {
          beforeSend: (xhrObject: XMLHttpRequest) => {
            xhrObject.upload.onprogress = (event: ProgressEvent) => {
              const currentProgress = event.loaded / event.total;
              progress(currentProgress);
            };
          },
          headers: {
            "Content-Type": this.file.type,
            "Content-Range": `bytes ${rangeStart}-${rangeEnd}/${this.file.size}`,
          },
          url: endpoint.url,
          method: endpoint.method,
          body: chunk,
        },
        signal
      );

      this.dispatch("chunkSuccess", chunkNumber);

      return resp.headers.etag;
    });
  }

  private async sendChunks() {
    const abortController = new AbortController();
    const promises = Array(this.totalChunks)
      .fill(0)
      .map((_, i) => () => this.sendChunk(i, abortController.signal));
    const allChunksPromise = PProgress.allSettled(promises, {
      concurrency: this.concurrentUploads,
    });
    allChunksPromise.onProgress((progress) => {
      this.dispatch("progress", progress);
    });

    const result = await allChunksPromise;

    if (result.some((promise) => promise.status === "rejected")) {
      this.dispatch("error");
    }

    if (result.every((promise) => promise.status === "fulfilled")) {
      this.dispatch("success", {
        etags: result.map((promise) =>
          promise.status === "fulfilled" ? promise.value : ""
        ),
      });
    }

    this.abortController = abortController;
  }
}
