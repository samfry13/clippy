import { Card, CardHeader, CardMedia } from '@mui/material';
import CardProgress from './CardProgress';

const UploadingVideoCard = ({
  file,
  progress,
}: {
  file: File;
  progress: number;
}) => {
  return (
    <>
      <Card sx={{ maxWidth: 345 }} elevation={5}>
        <CardHeader
          sx={{
            display: 'flex',
            overflow: 'hidden',
            '& .MuiCardHeader-content': {
              overflow: 'hidden',
            },
          }}
          titleTypographyProps={{ noWrap: true }}
          title={file.name}
          subheaderTypographyProps={{ noWrap: true, variant: 'caption' }}
          subheader={progress < 100 ? 'Uploading...' : 'Processing...'}
        />
        <CardMedia>
          <CardProgress progress={progress} />
        </CardMedia>
      </Card>
    </>
  );
};

export default UploadingVideoCard;
