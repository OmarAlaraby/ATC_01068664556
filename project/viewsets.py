from rest_framework import viewsets, status
from rest_framework.response import Response

class AreebViewSet(viewsets.ModelViewSet):
    '''
        i overrided the ModelViewSet class to just edit the returned response
    '''
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({
                'status': "success",
                'message': f'{self.basename} created successfully',
                'data': response.data
            }, status=status.HTTP_201_CREATED)
        
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({
                'status': "success",
                'message': f'{self.basename} updated successfully',
                'data': response.data
            }, status=status.HTTP_200_OK)
        
    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return Response({
                'status': "success",
                'message': f'{self.basename} deleted successfully',
            }, status=status.HTTP_204_NO_CONTENT)
        
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({
                'status': "success",
                'message': f'{self.basename} retrieved successfully',
                'data': response.data
            }, status=status.HTTP_200_OK)
        
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({
                'status': "success",
                'message': f'{self.basename} retrieved successfully',
                'data': response.data
            }, status=status.HTTP_200_OK)